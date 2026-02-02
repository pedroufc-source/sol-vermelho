extends CharacterBody2D

# Controlador de Veiculo

signal entered
signal exited

# Configuracoes
@export var max_speed: float = 500.0
@export var acceleration: float = 300.0
@export var friction: float = 200.0
@export var rotation_speed: float = 3.0
@export var hit_damage: int = 30

# Estado
var is_occupied: bool = false
var driver: CharacterBody2D = null
var current_speed: float = 0.0

# Referencias
@onready var sprite: Sprite2D = $Sprite2D
@onready var collision: CollisionShape2D = $CollisionShape2D
@onready var hit_area: Area2D = $HitArea

func _ready() -> void:
	add_to_group("vehicles")

func _physics_process(delta: float) -> void:
	if not is_occupied:
		# Aplica friccao quando vazio
		current_speed = move_toward(current_speed, 0, friction * delta)
		velocity = Vector2.from_angle(rotation - PI/2) * current_speed
		move_and_slide()
		return

	handle_driving(delta)
	move_and_slide()

func handle_driving(delta: float) -> void:
	# Aceleracao e frenagem
	var throttle = Input.get_axis("move_down", "move_up")

	if throttle != 0:
		current_speed += throttle * acceleration * delta
		current_speed = clamp(current_speed, -max_speed * 0.5, max_speed)
	else:
		# Desacelera naturalmente
		current_speed = move_toward(current_speed, 0, friction * delta)

	# Rotacao (so funciona se estiver em movimento)
	if abs(current_speed) > 10:
		var turn = Input.get_axis("move_left", "move_right")
		var turn_modifier = current_speed / max_speed  # Gira menos em baixa velocidade
		rotation += turn * rotation_speed * turn_modifier * delta

	# Aplica velocidade na direcao atual
	var direction = Vector2.from_angle(rotation - PI/2)
	velocity = direction * current_speed

func enter(player: CharacterBody2D) -> void:
	is_occupied = true
	driver = player
	entered.emit()
	print("Entrou no veiculo")

func exit() -> void:
	is_occupied = false
	driver = null
	current_speed *= 0.5  # Reduz velocidade ao sair
	exited.emit()
	print("Saiu do veiculo")

func get_exit_position() -> Vector2:
	# Posicao ao lado do veiculo
	var offset = Vector2(60, 0).rotated(rotation)
	return global_position + offset

func _on_hit_area_body_entered(body: Node2D) -> void:
	# So causa dano se estiver em movimento rapido
	if abs(current_speed) < 100:
		return

	if body.is_in_group("npcs") and body.has_method("take_damage"):
		var damage = int(hit_damage * (abs(current_speed) / max_speed))
		body.take_damage(damage)
		# Reduz velocidade ao atropelar
		current_speed *= 0.7
