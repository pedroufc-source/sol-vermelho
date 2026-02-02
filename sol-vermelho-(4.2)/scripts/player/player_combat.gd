extends Node

# Sistema de Combate do Jogador

signal weapon_changed(weapon_name: String)
signal ammo_changed(current: int, max_ammo: int)

# Armas disponiveis
enum Weapon { FISTS, PISTOL }
var current_weapon: Weapon = Weapon.FISTS

# Estatisticas das armas
var weapons_data: Dictionary = {
	Weapon.FISTS: {
		"name": "Punhos",
		"damage": 15,
		"range": 50.0,
		"cooldown": 0.4,
		"ammo": -1  # Infinito
	},
	Weapon.PISTOL: {
		"name": "Pistola",
		"damage": 25,
		"range": 400.0,
		"cooldown": 0.3,
		"ammo": 30
	}
}

var can_attack: bool = true
var pistol_ammo: int = 30

# Referencia ao jogador
var player: CharacterBody2D

func _ready() -> void:
	player = get_parent()

func _input(event: InputEvent) -> void:
	if player.is_in_vehicle:
		return

	if event.is_action_pressed("attack"):
		attack()

	# Trocar arma com scroll ou numero
	if event.is_action_pressed("ui_focus_next"):
		cycle_weapon(1)
	elif event.is_action_pressed("ui_focus_prev"):
		cycle_weapon(-1)

func attack() -> void:
	if not can_attack:
		return

	can_attack = false

	match current_weapon:
		Weapon.FISTS:
			melee_attack()
		Weapon.PISTOL:
			shoot()

	# Cooldown
	var cooldown = weapons_data[current_weapon]["cooldown"]
	await get_tree().create_timer(cooldown).timeout
	can_attack = true

func melee_attack() -> void:
	var damage = weapons_data[Weapon.FISTS]["damage"]
	var range_dist = weapons_data[Weapon.FISTS]["range"]

	# Efeito visual
	player.sprite.scale = Vector2(2.5, 2.5)
	await get_tree().create_timer(0.1).timeout
	player.sprite.scale = Vector2(2, 2)

	# Detecta inimigos no alcance
	var space_state = player.get_world_2d().direct_space_state
	var direction = Vector2.from_angle(player.rotation - PI/2)

	# Verifica NPCs proximos
	for npc in get_tree().get_nodes_in_group("npcs"):
		var distance = player.global_position.distance_to(npc.global_position)
		if distance < range_dist:
			# Verifica se esta na direcao do ataque (cone de 90 graus)
			var to_npc = (npc.global_position - player.global_position).normalized()
			var angle = direction.angle_to(to_npc)
			if abs(angle) < PI/4:  # 45 graus para cada lado
				if npc.has_method("take_damage"):
					npc.take_damage(damage)

func shoot() -> void:
	if pistol_ammo <= 0:
		# Som de arma vazia
		print("Sem municao!")
		return

	pistol_ammo -= 1
	ammo_changed.emit(pistol_ammo, weapons_data[Weapon.PISTOL]["ammo"])

	var damage = weapons_data[Weapon.PISTOL]["damage"]
	var range_dist = weapons_data[Weapon.PISTOL]["range"]

	# Direcao do tiro (para onde o jogador esta olhando)
	var direction = Vector2.from_angle(player.rotation - PI/2)
	var start_pos = player.global_position
	var end_pos = start_pos + direction * range_dist

	# Raycast para detectar hit
	var space_state = player.get_world_2d().direct_space_state
	var query = PhysicsRayQueryParameters2D.create(start_pos, end_pos)
	query.collision_mask = 2  # Layer dos NPCs
	query.exclude = [player]

	var result = space_state.intersect_ray(query)

	if result:
		var hit_body = result.collider
		if hit_body.has_method("take_damage"):
			hit_body.take_damage(damage)

	# Efeito visual do tiro (linha temporaria)
	create_bullet_trail(start_pos, result.position if result else end_pos)

func create_bullet_trail(start: Vector2, end: Vector2) -> void:
	var line = Line2D.new()
	line.width = 2.0
	line.default_color = Color.YELLOW
	line.add_point(start)
	line.add_point(end)
	player.get_parent().add_child(line)

	# Remove apos um curto tempo
	await get_tree().create_timer(0.05).timeout
	line.queue_free()

func cycle_weapon(direction: int) -> void:
	var weapons = Weapon.values()
	var current_index = weapons.find(current_weapon)
	current_index = (current_index + direction) % weapons.size()
	current_weapon = weapons[current_index]

	var weapon_name = weapons_data[current_weapon]["name"]
	weapon_changed.emit(weapon_name)
	print("Arma atual: %s" % weapon_name)

func add_ammo(amount: int) -> void:
	pistol_ammo += amount
	pistol_ammo = min(pistol_ammo, 100)  # Maximo
	ammo_changed.emit(pistol_ammo, weapons_data[Weapon.PISTOL]["ammo"])

func get_current_weapon_name() -> String:
	return weapons_data[current_weapon]["name"]

func get_current_ammo() -> int:
	if current_weapon == Weapon.PISTOL:
		return pistol_ammo
	return -1
