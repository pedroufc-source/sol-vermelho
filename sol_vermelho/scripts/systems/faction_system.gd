extends Node

# Sistema de Faccoes - Gerencia territorios e reputacao

signal reputation_changed(faction_id: String, new_value: int)
signal territory_entered(faction_id: String)
signal territory_exited(faction_id: String)

# Dados das faccoes
var factions: Dictionary = {
	"comando_solar": {
		"name": "Comando Solar",
		"color": Color(0.2, 0.4, 0.9),  # Azul
		"player_reputation": 0,  # -100 a 100
		"hostile_threshold": -30  # Abaixo disso, ataca o jogador
	},
	"tropa_periferia": {
		"name": "Tropa da Periferia",
		"color": Color(0.9, 0.2, 0.2),  # Vermelho
		"player_reputation": 0,
		"hostile_threshold": -30
	}
}

# Territorio atual do jogador
var current_territory: String = "neutral"

func _ready() -> void:
	print("Sistema de Faccoes inicializado")

# Retorna dados de uma faccao
func get_faction(faction_id: String) -> Dictionary:
	if factions.has(faction_id):
		return factions[faction_id]
	return {}

# Retorna a cor de uma faccao
func get_faction_color(faction_id: String) -> Color:
	if factions.has(faction_id):
		return factions[faction_id]["color"]
	return Color.GRAY

# Retorna o nome de uma faccao
func get_faction_name(faction_id: String) -> String:
	if factions.has(faction_id):
		return factions[faction_id]["name"]
	return "Zona Neutra"

# Modifica reputacao com uma faccao
func modify_reputation(faction_id: String, amount: int) -> void:
	if not factions.has(faction_id):
		return

	var old_rep = factions[faction_id]["player_reputation"]
	factions[faction_id]["player_reputation"] = clamp(old_rep + amount, -100, 100)
	var new_rep = factions[faction_id]["player_reputation"]

	if old_rep != new_rep:
		reputation_changed.emit(faction_id, new_rep)
		print("Reputacao com %s: %d -> %d" % [factions[faction_id]["name"], old_rep, new_rep])

# Retorna a reputacao atual com uma faccao
func get_reputation(faction_id: String) -> int:
	if factions.has(faction_id):
		return factions[faction_id]["player_reputation"]
	return 0

# Verifica se uma faccao e hostil ao jogador
func is_faction_hostile(faction_id: String) -> bool:
	if not factions.has(faction_id):
		return false
	var rep = factions[faction_id]["player_reputation"]
	var threshold = factions[faction_id]["hostile_threshold"]
	return rep < threshold

# Define o territorio atual
func set_current_territory(territory_id: String) -> void:
	if current_territory != territory_id:
		if current_territory != "neutral":
			territory_exited.emit(current_territory)
		current_territory = territory_id
		if territory_id != "neutral":
			territory_entered.emit(territory_id)
		print("Territorio atual: %s" % get_faction_name(territory_id))

# Retorna o territorio atual
func get_current_territory() -> String:
	return current_territory

# Matar membro de faccao diminui reputacao
func on_faction_member_killed(faction_id: String) -> void:
	modify_reputation(faction_id, -15)
	# Aumenta um pouco com a faccao rival
	var rival = get_rival_faction(faction_id)
	if rival != "":
		modify_reputation(rival, 5)

# Retorna a faccao rival
func get_rival_faction(faction_id: String) -> String:
	match faction_id:
		"comando_solar":
			return "tropa_periferia"
		"tropa_periferia":
			return "comando_solar"
	return ""
