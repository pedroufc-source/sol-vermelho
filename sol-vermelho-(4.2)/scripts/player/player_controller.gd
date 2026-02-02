extends CharacterBody2D

# Controlador do Jogador - Movimento e interacoes basicas

signal health_changed(new_health: int)
signal died

# Estatisticas
@export var max_health: int = 100
@export var walk_speed: float = 200.0
@export var run_speed: float = 350.0

var health: int = 100
var is_in_vehicle: bool = false
var current_vehicle: CharacterBody2D = null
var nearby_vehicle: CharacterBody2D = null

# Referencias aos nodes
@onready var sprite: Sprite2D = $Sprite2D
@onready var collision: CollisionShape2D = $CollisionShape2D
@onready var vehicle_detector: Area2D = $VehicleDetector

func _ready() -> void:
	health = max_health
	GameManager.register_player(self)
	add_to_group("player")

func _physics_process(delta: float) -> void:
	if is_in_vehicle:
		return

	handle_movement()
	move_and_slide()

func handle_movement() -> void:
	# Captura input
	var input_dir = Vector2.ZERO
	input_dir.x = Input.get_axis("move_left", "move_right")
	input_dir.y = Input.get_axis("move_up", "move_down")
	input_dir = input_dir.normalized()

	# Velocidade baseada em correr ou andar
	var speed = run_speed if Input.is_action_pressed("run") else walk_speed

	# Aplica velocidade
	velocity = input_dir * speed

	# Rotaciona sprite na direcao do movimento
	if input_dir != Vector2.ZERO:
		rotation = input_dir.angle() + PI/2

func _input(event: InputEvent) -> void:
	# Entrar/sair de veiculo
	if event.is_action_pressed("action"):
		if is_in_vehicle:
			exit_vehicle()
		elif nearby_vehicle:
			enter_vehicle(nearby_vehicle)

func enter_vehicle(vehicle: CharacterBody2D) -> void:
	if not vehicle.has_method("enter"):
		return

	is_in_vehicle = true
	current_vehicle = vehicle
	vehicle.enter(self)

	# Esconde o jogador
	visible = false
	collision.disabled = true
	GameManager.register_vehicle(vehicle)

func exit_vehicle() -> void:
	if not current_vehicle:
		return

	var exit_pos = current_vehicle.get_exit_position()
	global_position = exit_pos

	current_vehicle.exit()
	current_vehicle = null
	is_in_vehicle = false

	# Mostra o jogador
	visible = true
	collision.disabled = false
	GameManager.unregister_vehicle()

func take_damage(amount: int) -> void:
	health -= amount
	health = max(health, 0)
	health_changed.emit(health)

	# Efeito visual de dano
	modulate = Color.RED
	await get_tree().create_timer(0.1).timeout
	modulate = Color.WHITE

	if health <= 0:
		die()

func die() -> void:
	died.emit()
	GameManager.on_player_death()

func heal(amount: int) -> void:
	health += amount
	health = min(health, max_health)
	health_changed.emit(health)

# Detecta veiculos proximos
func _on_vehicle_detector_body_entered(body: Node2D) -> void:
	if body.is_in_group("vehicles"):
		nearby_vehicle = body

func _on_vehicle_detector_body_exited(body: Node2D) -> void:
	if body == nearby_vehicle:
		nearby_vehicle = null
