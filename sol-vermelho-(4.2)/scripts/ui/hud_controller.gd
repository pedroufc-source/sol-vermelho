extends CanvasLayer

# HUD Controller - Interface do jogador

@onready var health_bar: ProgressBar = $MarginContainer/VBoxContainer/HealthBar
@onready var health_label: Label = $MarginContainer/VBoxContainer/HealthBar/Label
@onready var territory_label: Label = $MarginContainer/VBoxContainer/TerritoryLabel
@onready var weapon_label: Label = $MarginContainer/VBoxContainer/WeaponLabel
@onready var cs_reputation: ProgressBar = $MarginContainer/VBoxContainer/ReputationContainer/CSReputation
@onready var tp_reputation: ProgressBar = $MarginContainer/VBoxContainer/ReputationContainer/TPReputation

func _ready() -> void:
	# Conecta aos sinais do FactionSystem
	FactionSystem.reputation_changed.connect(_on_reputation_changed)
	FactionSystem.territory_entered.connect(_on_territory_changed)
	FactionSystem.territory_exited.connect(_on_territory_exited)

	# Inicializa valores
	update_territory("neutral")
	update_reputation("comando_solar", 0)
	update_reputation("tropa_periferia", 0)

	# Aguarda o player estar pronto
	await get_tree().create_timer(0.1).timeout
	connect_player_signals()

func connect_player_signals() -> void:
	var player = GameManager.player
	if player:
		player.health_changed.connect(_on_health_changed)
		_on_health_changed(player.health)

		# Conecta ao sistema de combate se existir
		if player.has_node("Combat"):
			var combat = player.get_node("Combat")
			combat.weapon_changed.connect(_on_weapon_changed)
			combat.ammo_changed.connect(_on_ammo_changed)

func _on_health_changed(new_health: int) -> void:
	health_bar.value = new_health
	health_label.text = "HP: %d/100" % new_health

	# Muda cor baseado na vida
	if new_health < 30:
		health_bar.modulate = Color.RED
	elif new_health < 60:
		health_bar.modulate = Color.YELLOW
	else:
		health_bar.modulate = Color.GREEN

func _on_reputation_changed(faction_id: String, new_value: int) -> void:
	update_reputation(faction_id, new_value)

func update_reputation(faction_id: String, value: int) -> void:
	# Converte de -100~100 para 0~100 para a barra
	var bar_value = (value + 100) / 2.0

	match faction_id:
		"comando_solar":
			cs_reputation.value = bar_value
			var color = Color.GREEN if value > 0 else Color.RED if value < 0 else Color.GRAY
			cs_reputation.modulate = color
		"tropa_periferia":
			tp_reputation.value = bar_value
			var color = Color.GREEN if value > 0 else Color.RED if value < 0 else Color.GRAY
			tp_reputation.modulate = color

func _on_territory_changed(faction_id: String) -> void:
	update_territory(faction_id)

func _on_territory_exited(_faction_id: String) -> void:
	update_territory("neutral")

func update_territory(territory_id: String) -> void:
	var territory_name = FactionSystem.get_faction_name(territory_id)
	var color = FactionSystem.get_faction_color(territory_id)

	territory_label.text = "Territorio: %s" % territory_name
	territory_label.modulate = color if territory_id != "neutral" else Color.WHITE

func _on_weapon_changed(weapon_name: String) -> void:
	weapon_label.text = "Arma: %s" % weapon_name

func _on_ammo_changed(current: int, _max_ammo: int) -> void:
	var combat = GameManager.player.get_node("Combat") if GameManager.player else null
	if combat:
		var weapon_name = combat.get_current_weapon_name()
		if current >= 0:
			weapon_label.text = "Arma: %s (%d)" % [weapon_name, current]
		else:
			weapon_label.text = "Arma: %s" % weapon_name
