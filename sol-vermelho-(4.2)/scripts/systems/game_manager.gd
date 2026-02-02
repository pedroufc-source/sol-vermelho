extends Node

# Game Manager - Autoload global para gerenciar estado do jogo

signal game_paused
signal game_resumed
signal player_died
signal player_respawned

# Estado do jogo
var is_paused: bool = false
var player: CharacterBody2D = null
var current_vehicle: CharacterBody2D = null

# Configuracoes
const RESPAWN_POSITION = Vector2(640, 360)

func _ready() -> void:
	print("Sol Vermelho - Game Manager inicializado")

func _input(event: InputEvent) -> void:
	if event.is_action_pressed("ui_cancel"):
		toggle_pause()

func toggle_pause() -> void:
	is_paused = !is_paused
	get_tree().paused = is_paused
	if is_paused:
		game_paused.emit()
	else:
		game_resumed.emit()

func register_player(p: CharacterBody2D) -> void:
	player = p
	print("Player registrado no GameManager")

func register_vehicle(v: CharacterBody2D) -> void:
	current_vehicle = v

func unregister_vehicle() -> void:
	current_vehicle = null

func on_player_death() -> void:
	player_died.emit()
	# Respawn apos 2 segundos
	await get_tree().create_timer(2.0).timeout
	respawn_player()

func respawn_player() -> void:
	if player:
		player.global_position = RESPAWN_POSITION
		player.health = player.max_health
		player_respawned.emit()
