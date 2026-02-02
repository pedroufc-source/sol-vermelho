extends CanvasLayer

# Tela de Controles - Aparece no inicio do jogo

signal controls_dismissed

@onready var panel: Panel = $Panel
@onready var blink_label: Label = $Panel/VBoxContainer/BlinkLabel

var blink_timer: float = 0.0
var is_visible_text: bool = true

func _ready() -> void:
	# Pausa o jogo enquanto mostra os controles
	get_tree().paused = true
	process_mode = Node.PROCESS_MODE_ALWAYS

	# Fade in
	modulate.a = 0.0
	var tween = create_tween()
	tween.tween_property(self, "modulate:a", 1.0, 0.5)

func _process(delta: float) -> void:
	# Faz o texto "Pressione qualquer tecla" piscar
	blink_timer += delta
	if blink_timer >= 0.5:
		blink_timer = 0.0
		is_visible_text = !is_visible_text
		blink_label.modulate.a = 1.0 if is_visible_text else 0.3

func _input(event: InputEvent) -> void:
	# Qualquer tecla ou clique dispensa a tela
	if event is InputEventKey or event is InputEventMouseButton:
		if event.pressed:
			dismiss()

func dismiss() -> void:
	# Despausa o jogo
	get_tree().paused = false

	# Fade out e remove
	var tween = create_tween()
	tween.tween_property(self, "modulate:a", 0.0, 0.3)
	tween.tween_callback(queue_free)

	controls_dismissed.emit()
