extends Node2D

# Gerenciador de Territorios - Detecta quando jogador entra/sai de zonas

var territory_mapping: Dictionary = {
	"ZonaOrla": "comando_solar",
	"ZonaPeriferia": "tropa_periferia",
	"ZonaCentro": "neutral"
}

func _ready() -> void:
	# Conecta sinais de todas as zonas
	for child in get_children():
		if child is Area2D:
			child.body_entered.connect(_on_territory_entered.bind(child.name))
			child.body_exited.connect(_on_territory_exited.bind(child.name))

func _on_territory_entered(body: Node2D, territory_name: String) -> void:
	if body.is_in_group("player"):
		var faction_id = territory_mapping.get(territory_name, "neutral")
		FactionSystem.set_current_territory(faction_id)

func _on_territory_exited(body: Node2D, _territory_name: String) -> void:
	if body.is_in_group("player"):
		# Verifica se saiu para zona neutra
		FactionSystem.set_current_territory("neutral")
