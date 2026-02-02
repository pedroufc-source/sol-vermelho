extends CharacterBody2D

# Membro de Faccao - NPC com IA basica

signal died

# Configuracoes
@export var faction: String = "comando_solar"
@export var max_health: int = 50
@export var move_speed: float = 120.0
@export var attack_damage: int = 10
@export var attack_range: float = 50.0
@export var detection_range: float = 200.0
@export var attack_cooldown: float = 1.0

# Estado
enum State { IDLE, PATROL, ALERT, CHASE, ATTACK, DEAD }
var current_state: State = State.IDLE
var health: int = 50
var target: CharacterBody2D = null
var can_attack: bool = true
var patrol_point: Vector2 = Vector2.ZERO
var home_position: Vector2 = Vector2.ZERO

# Referencias
@onready var sprite: Sprite2D = $Sprite2D
@onready var collision: CollisionShape2D = $CollisionShape2D
@onready var detection_area: Area2D = $DetectionArea
@onready var attack_area: Area2D = $AttackArea

func _ready() -> void:
	health = max_health
	home_position = global_position
	patrol_point = home_position
	add_to_group("npcs")
	add_to_group(faction)

	# Define cor baseada na faccao
	var color = FactionSystem.get_faction_color(faction)
	sprite.modulate = color

	# Timer para patrulha
	var patrol_timer = Timer.new()
	patrol_timer.wait_time = randf_range(3.0, 6.0)
	patrol_timer.timeout.connect(_on_patrol_timer)
	add_child(patrol_timer)
	patrol_timer.start()

func _physics_process(delta: float) -> void:
	if current_state == State.DEAD:
		return

	match current_state:
		State.IDLE:
			process_idle()
		State.PATROL:
			process_patrol()
		State.ALERT:
			process_alert()
		State.CHASE:
			process_chase()
		State.ATTACK:
			process_attack()

	move_and_slide()

func process_idle() -> void:
	velocity = Vector2.ZERO
	check_for_player()

func process_patrol() -> void:
	var direction = (patrol_point - global_position).normalized()
	velocity = direction * move_speed * 0.5

	if global_position.distance_to(patrol_point) < 20:
		current_state = State.IDLE

	check_for_player()
	update_rotation()

func process_alert() -> void:
	velocity = Vector2.ZERO
	# Espera um momento antes de perseguir
	await get_tree().create_timer(0.5).timeout
	if target and is_instance_valid(target):
		current_state = State.CHASE

func process_chase() -> void:
	if not target or not is_instance_valid(target):
		current_state = State.IDLE
		return

	var direction = (target.global_position - global_position).normalized()
	velocity = direction * move_speed
	update_rotation()

	var distance = global_position.distance_to(target.global_position)

	if distance < attack_range:
		current_state = State.ATTACK
	elif distance > detection_range * 1.5:
		# Perdeu o alvo
		target = null
		current_state = State.IDLE

func process_attack() -> void:
	if not target or not is_instance_valid(target):
		current_state = State.IDLE
		return

	velocity = Vector2.ZERO
	var distance = global_position.distance_to(target.global_position)

	if distance > attack_range:
		current_state = State.CHASE
		return

	if can_attack:
		perform_attack()

func perform_attack() -> void:
	can_attack = false

	# Efeito visual de ataque
	sprite.scale = Vector2(2.5, 2.5)
	await get_tree().create_timer(0.1).timeout
	sprite.scale = Vector2(2, 2)

	# Aplica dano ao alvo
	if target and target.has_method("take_damage"):
		target.take_damage(attack_damage)

	# Cooldown
	await get_tree().create_timer(attack_cooldown).timeout
	can_attack = true

func check_for_player() -> void:
	var player = GameManager.player
	if not player:
		return

	var distance = global_position.distance_to(player.global_position)

	# Verifica se deve ser hostil
	if distance < detection_range and should_be_hostile():
		target = player
		current_state = State.ALERT

func should_be_hostile() -> bool:
	return FactionSystem.is_faction_hostile(faction) or FactionSystem.get_reputation(faction) < -20

func take_damage(amount: int) -> void:
	health -= amount
	health = max(health, 0)

	# Efeito visual
	sprite.modulate = Color.WHITE
	await get_tree().create_timer(0.1).timeout
	sprite.modulate = FactionSystem.get_faction_color(faction)

	# Se nao estava perseguindo, agora vai
	if current_state != State.CHASE and current_state != State.ATTACK:
		target = GameManager.player
		current_state = State.CHASE

	if health <= 0:
		die()

func die() -> void:
	current_state = State.DEAD
	died.emit()
	FactionSystem.on_faction_member_killed(faction)

	# Animacao de morte
	var tween = create_tween()
	tween.tween_property(sprite, "modulate:a", 0.0, 0.5)
	tween.tween_callback(queue_free)

func update_rotation() -> void:
	if velocity != Vector2.ZERO:
		rotation = velocity.angle() + PI/2

func _on_patrol_timer() -> void:
	if current_state == State.IDLE:
		# Define novo ponto de patrulha
		var offset = Vector2(randf_range(-150, 150), randf_range(-150, 150))
		patrol_point = home_position + offset
		current_state = State.PATROL

func _on_detection_area_body_entered(body: Node2D) -> void:
	if body.is_in_group("player") and should_be_hostile():
		target = body
		current_state = State.ALERT
