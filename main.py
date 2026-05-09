# ─────────────────────────────────────────
# TILE DEĞİŞİKLİKLERİNİ KAYDETME SİSTEMİ
# ─────────────────────────────────────────
saved_x = [0]
saved_x.pop()
saved_y = [0]
saved_y.pop()
saved_tiles = [assets.tile("""
    Zone
    """)]
saved_tiles.pop()

def save_tile_change(tx: number, ty: number, tile_image: Image):
    i = 0
    while i <= len(saved_x) - 1:
        if saved_x[i] == tx and saved_y[i] == ty:
            saved_tiles[i] = tile_image
            return
        i += 1
    saved_x.append(tx)
    saved_y.append(ty)
    saved_tiles.append(tile_image)

def apply_saved_changes():
    j = 0
    while j <= len(saved_x) - 1:
        restored_loc = tiles.get_tile_location(saved_x[j], saved_y[j])
        tiles.set_tile_at(restored_loc, saved_tiles[j])
        j += 1

# ─────────────────────────────────────────
# GLOBAL DEĞİŞKENLER
# ─────────────────────────────────────────
last_y = 0
last_x = 0
lastloc: tiles.Location = None
last_tile: Image = None
editoron = False
y = 0
x = 0
player2: Sprite = None
saved_tiles = []
saved_y = []
saved_x = []
loc: tiles.Location = None
vy = 0
vx = 0
happiness = 80
para = 1000
info.set_life(happiness)

# ─────────────────────────────────────────
# MUTLULUK: eski ve yeni tile'a göre güncelle
# ─────────────────────────────────────────
def update_happiness(old_tile: Image, new_tile: Image):
    global happiness
    if old_tile == assets.tile("""
        Windmill
        """):
        happiness += -1
    elif old_tile == assets.tile("""
        Coal_Plant
        """):
        happiness += 1
    if new_tile == assets.tile("""
        Windmill
        """):
        happiness += 1
    elif new_tile == assets.tile("""
        Coal_Plant
        """):
        happiness += -1
    happiness = Math.constrain(happiness, 0, 100)
    info.set_life(happiness)

# ─────────────────────────────────────────
# B TUŞU — Menü aç (haritada) / Tile seç (editörde)
# ─────────────────────────────────────────
def on_b_pressed():
    global x, y, loc, lastloc, last_x, last_y, last_tile, editoron, para

    x = Math.idiv(player2.x, 16)
    y = Math.idiv(player2.y, 16)
    loc = tiles.get_tile_location(x, y)
    current_tile = tiles.get_tile_image(loc)

    if not editoron:
        # ── NORMAL HARİTA: builder menüsünü aç ──
        if current_tile == assets.tile("""
            Zone
            """) or current_tile == assets.tile("""
            Windmill
            """) or current_tile == assets.tile("""
            Coal_Plant
            """):
            lastloc = loc
            last_x = x
            last_y = y
            last_tile = current_tile
            tiles.set_current_tilemap(tilemap("""
                Builder_menu
                """))
            player2.set_position(75, 75)
            editoron = True
        else:
            game.splash("Burayla işin yok!")
    else:
        # ── BUILDER MENÜSÜ: tile seç ve kaydet ──
        chosen_tile = None
        cost = 0

        if current_tile == assets.tile("""
            Windmill
            """):
            chosen_tile = assets.tile("""
                Windmill
                """)
            cost = 2000
        elif current_tile == assets.tile("""
            Coal_Plant
            """):
            chosen_tile = assets.tile("""
                Coal_Plant
                """)
            cost = 1000
        elif current_tile == assets.tile("""
            Zone
            """):
            chosen_tile = assets.tile("""
                Zone
                """)
            cost = 0
        elif current_tile == assets.tile("""
            Exit
            """):
            tiles.set_current_tilemap(tilemap("""
                level1
                """))
            tiles.place_on_tile(player2, lastloc)
            apply_saved_changes()
            editoron = False

        if chosen_tile is not None:
            # Para kontrolü
            if para < cost:
                game.splash("YETERSİZ BAKİYE")
            else:
                para -= cost
                info.set_score(para)
                update_happiness(last_tile, chosen_tile)
                save_tile_change(last_x, last_y, chosen_tile)
                tiles.set_current_tilemap(tilemap("""
                    level1
                    """))
                tiles.place_on_tile(player2, lastloc)
                tiles.set_tile_at(lastloc, chosen_tile)
                apply_saved_changes()
                editoron = False

controller.B.on_event(ControllerButtonEvent.PRESSED, on_b_pressed)

# ─────────────────────────────────────────
# A TUŞU — Haritada bilgi göster
# ─────────────────────────────────────────
def on_a_pressed():
    global x, y, loc

    if editoron:
        return

    x = Math.idiv(player2.x, 16)
    y = Math.idiv(player2.y, 16)
    loc = tiles.get_tile_location(x, y)
    current_tile2 = tiles.get_tile_image(loc)

    if current_tile2 == assets.tile("""
        Coal_Plant
        """):
        game.show_long_text("Bu bir kömür santrali. (1000 para)", DialogLayout.BOTTOM)
        game.show_long_text("Bu santral şehir için zararlı.", DialogLayout.BOTTOM)
    elif current_tile2 == assets.tile("""
        Zone
        """):
        game.show_long_text("Bu bir boş arazi. (0 para)", DialogLayout.BOTTOM)
        game.show_long_text("Buraya bir enerji santrali inşa edilebilir.",
            DialogLayout.BOTTOM)
    elif current_tile2 == assets.tile("""
        Windmill
        """):
        game.show_long_text("Bu bir rüzgar türbini. (2000 para)", DialogLayout.BOTTOM)
        game.show_long_text("Bu santral şehir için zararlı değil.", DialogLayout.BOTTOM)
    elif current_tile2 == assets.tile("""
        Exit
        """):
        game.show_long_text("Buradan çıkmak için B tuşuna bas.", DialogLayout.BOTTOM)
    else:
        game.splash("Burayla işin yok!")

controller.A.on_event(ControllerButtonEvent.PRESSED, on_a_pressed)

# ─────────────────────────────────────────
# GİRİŞ / INTRO
# ─────────────────────────────────────────
tripgameslogo = sprites.create(assets.image("""
    Trip Games
    """), SpriteKind.food)
tripgameslogo.set_scale(2.5, ScaleAnchor.MIDDLE)
scene.set_background_color(12)
pause(3)
game.set_dialog_frame(img("""
    b d b b b b b b b b b b b c b b
    d d d d d d d d d d d d d c d b
    b d b b b b b b b b b b b c b b
    b d b d d b b b b b b b b c b b
    b d b d b b b b b b b b b c b b
    b d b b b b b b b b b b b c b b
    b d b b b b b b b b b b b c b b
    b d b b b b b b b b b b b c b b
    b d b b b b b b b b b b b c b b
    b d b b b b b b b b b b b c b b
    b d b b b b b b b b b c b c b b
    b d b b b b b b b b c c b c b b
    b d b b b b b b b b b b b c b b
    c d c c c c c c c c c c c c c b
    b d b b b b b b b b b b b c b b
    b b b b b b b b b b b b b b b b
    """))
game.show_long_text("Şehrimiz uzun bir zamandır verimsiz enerji kirliliğinde.",
    DialogLayout.BOTTOM)
game.show_long_text("Hava kirliliği ve elektrik kesintileri",
    DialogLayout.BOTTOM)
game.show_long_text("Halkı mutsuz ediyordu.", DialogLayout.BOTTOM)
game.show_long_text("Bu olumsuz durumu düzeltmek için belediyemiz...",
    DialogLayout.BOTTOM)
game.show_long_text("SENİ görevlendirdi.", DialogLayout.BOTTOM)
game.show_long_text("Halkımızı yüzüstü bırakma...", DialogLayout.BOTTOM)
game.show_long_text("-TRİPOWER EFELER- bir Trip Games GameJam projesi",
    DialogLayout.BOTTOM)
sprites.destroy_all_sprites_of_kind(SpriteKind.food)

# ─────────────────────────────────────────
# OYUNCU OLUŞTURMA & HARİTA YÜKLEME
# ─────────────────────────────────────────
player2 = sprites.create(img("""
        1 1 1 1 . . . . . . . . 1 1 1 1
        1 f f 1 . . . . . . . . 1 f f 1
        1 f 1 1 . . . . . . . . 1 1 f 1
        1 1 1 . . . . . . . . . . 1 1 1
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        1 1 1 . . . . . . . . . . 1 1 1
        1 f 1 1 . . . . . . . . 1 1 f 1
        1 f f 1 . . . . . . . . 1 f f 1
        1 1 1 1 . . . . . . . . 1 1 1 1
        """),
    SpriteKind.player)
tiles.set_current_tilemap(tilemap("""
    level1
    """))
scene.camera_follow_sprite(player2)
game.show_long_text("Şehir verimsiz enerji kaynakları kullanıyor.",
    DialogLayout.BOTTOM)
game.show_long_text("Bu durumu düzeltmek senin elinde.", DialogLayout.BOTTOM)
game.show_long_text("Verimsiz enerji kaynaklarını...", DialogLayout.BOTTOM)
game.show_long_text("Temizleri ile değiştir.", DialogLayout.BOTTOM)
game.show_long_text(
    "Enerji kaynaklarını eklemek için sanayi bölgesindeki alanların üzerine gel",
    DialogLayout.CENTER)
game.splash("B = Değiştirme menüsü")
game.splash("A = Tile hakkında bilgi")

# ─────────────────────────────────────────
# HAREKET
# ─────────────────────────────────────────
def on_on_update():
    global vx, vy
    if controller.right.is_pressed():
        if vx < 0:
            vx = 0.5
        vx += 10
    elif controller.left.is_pressed():
        if vx > 0:
            vx = -0.5
        vx += 0 - 10
    else:
        vx *= 0.7
    if controller.up.is_pressed():
        if vy > 0:
            vy = -0.5
        vy += 0 - 10
    elif controller.down.is_pressed():
        if vy < 0:
            vy = 0.5
        vy += 10
    else:
        vy *= 0.7
    vx = Math.constrain(vx, -200, 200)
    vy = Math.constrain(vy, -200, 200)
    player2.vx = vx
    player2.vy = vy
game.on_update(on_on_update)

# ─────────────────────────────────────────
# PARA / SKOR
# ─────────────────────────────────────────
def on_on_update2():
    global para
    pause(1)
    para += 0.005 * happiness
    info.set_score(para)
    if happiness >= 150 and para >= 40000:
        game.set_game_over_effect(True, effects.confetti)
        game.set_game_over_message(True, "BAŞARDIN!")
        game.set_game_over_playable(True, music.melody_playable(music.power_up), False)
        game.game_over(True)
game.on_update(on_on_update2)