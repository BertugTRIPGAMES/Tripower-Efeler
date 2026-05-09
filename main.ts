//  ─────────────────────────────────────────
//  TILE DEĞİŞİKLİKLERİNİ KAYDETME SİSTEMİ
//  ─────────────────────────────────────────
let saved_x = [0]
saved_x.pop()
let saved_y = [0]
saved_y.pop()
let saved_tiles = [assets.tile`
    Zone
    `]
saved_tiles.pop()
function save_tile_change(tx: number, ty: number, tile_image: Image) {
    let i = 0
    while (i <= saved_x.length - 1) {
        if (saved_x[i] == tx && saved_y[i] == ty) {
            saved_tiles[i] = tile_image
            return
        }
        
        i += 1
    }
    saved_x.push(tx)
    saved_y.push(ty)
    saved_tiles.push(tile_image)
}

function apply_saved_changes() {
    let restored_loc: tiles.Location;
    let j = 0
    while (j <= saved_x.length - 1) {
        restored_loc = tiles.getTileLocation(saved_x[j], saved_y[j])
        tiles.setTileAt(restored_loc, saved_tiles[j])
        j += 1
    }
}

//  ─────────────────────────────────────────
//  GLOBAL DEĞİŞKENLER
//  ─────────────────────────────────────────
let last_y = 0
let last_x = 0
let lastloc : tiles.Location = null
let last_tile : Image = null
let editoron = false
let y = 0
let x = 0
let player2 : Sprite = null
saved_tiles = []
saved_y = []
saved_x = []
let loc : tiles.Location = null
let vy = 0
let vx = 0
let happiness = 80
let para = 1500
info.setLife(happiness)
//  ─────────────────────────────────────────
//  MUTLULUK: eski ve yeni tile'a göre güncelle
//  ─────────────────────────────────────────
function update_happiness(old_tile: Image, new_tile: Image) {
    
    if (old_tile == assets.tile`
        Windmill
        `) {
        happiness += -1
    } else if (old_tile == assets.tile`
        Coal_Plant
        `) {
        happiness += 1
    }
    
    if (new_tile == assets.tile`
        Windmill
        `) {
        happiness += 1
    } else if (new_tile == assets.tile`
        Coal_Plant
        `) {
        happiness += -1
    }
    
    happiness = Math.constrain(happiness, 0, 100)
    info.setLife(happiness)
}

//  ─────────────────────────────────────────
//  B TUŞU — Menü aç (haritada) / Tile seç (editörde)
//  ─────────────────────────────────────────
controller.B.onEvent(ControllerButtonEvent.Pressed, function on_b_pressed() {
    let chosen_tile: Image;
    let cost: number;
    
    x = Math.idiv(player2.x, 16)
    y = Math.idiv(player2.y, 16)
    loc = tiles.getTileLocation(x, y)
    let current_tile = tiles.getTileImage(loc)
    if (!editoron) {
        //  ── NORMAL HARİTA: builder menüsünü aç ──
        if (current_tile == assets.tile`
            Zone
            ` || current_tile == assets.tile`
            Windmill
            ` || current_tile == assets.tile`
            Coal_Plant
            `) {
            lastloc = loc
            last_x = x
            last_y = y
            last_tile = current_tile
            tiles.setCurrentTilemap(tilemap`
                Builder_menu
                `)
            player2.setPosition(75, 75)
            editoron = true
        } else {
            game.splash("Burayla işin yok!")
        }
        
    } else {
        //  ── BUILDER MENÜSÜ: tile seç ve kaydet ──
        chosen_tile = null
        cost = 0
        if (current_tile == assets.tile`
            Windmill
            `) {
            chosen_tile = assets.tile`
                Windmill
                `
            cost = 2000
        } else if (current_tile == assets.tile`
            Coal_Plant
            `) {
            chosen_tile = assets.tile`
                Coal_Plant
                `
            cost = 1000
        } else if (current_tile == assets.tile`
            Zone
            `) {
            chosen_tile = assets.tile`
                Zone
                `
            cost = 0
        } else if (current_tile == assets.tile`
            Exit
            `) {
            tiles.setCurrentTilemap(tilemap`
                level1
                `)
            tiles.placeOnTile(player2, lastloc)
            apply_saved_changes()
            editoron = false
        }
        
        if (chosen_tile !== null) {
            //  Para kontrolü
            if (para < cost) {
                game.splash("YETERSİZ BAKİYE")
            } else {
                para -= cost
                info.setScore(para)
                update_happiness(last_tile, chosen_tile)
                save_tile_change(last_x, last_y, chosen_tile)
                tiles.setCurrentTilemap(tilemap`
                    level1
                    `)
                tiles.placeOnTile(player2, lastloc)
                tiles.setTileAt(lastloc, chosen_tile)
                apply_saved_changes()
                editoron = false
            }
            
        }
        
    }
    
})
//  ─────────────────────────────────────────
//  A TUŞU — Haritada bilgi göster
//  ─────────────────────────────────────────
controller.A.onEvent(ControllerButtonEvent.Pressed, function on_a_pressed() {
    
    if (editoron) {
        return
    }
    
    x = Math.idiv(player2.x, 16)
    y = Math.idiv(player2.y, 16)
    loc = tiles.getTileLocation(x, y)
    let current_tile2 = tiles.getTileImage(loc)
    if (current_tile2 == assets.tile`
        Coal_Plant
        `) {
        game.showLongText("Bu bir kömür santrali. (1000 para)", DialogLayout.Bottom)
        game.showLongText("Bu santral şehir için zararlı.", DialogLayout.Bottom)
    } else if (current_tile2 == assets.tile`
        Zone
        `) {
        game.showLongText("Bu bir boş arazi. (0 para)", DialogLayout.Bottom)
        game.showLongText("Buraya bir enerji santrali inşa edilebilir.", DialogLayout.Bottom)
    } else if (current_tile2 == assets.tile`
        Windmill
        `) {
        game.showLongText("Bu bir rüzgar türbini. (2000 para)", DialogLayout.Bottom)
        game.showLongText("Bu santral şehir için zararlı değil.", DialogLayout.Bottom)
    } else if (current_tile2 == assets.tile`
        Exit
        `) {
        game.showLongText("Buradan çıkmak için B tuşuna bas.", DialogLayout.Bottom)
    } else {
        game.splash("Burayla işin yok!")
    }
    
})
//  ─────────────────────────────────────────
//  GİRİŞ / INTRO
//  ─────────────────────────────────────────
let tripgameslogo = sprites.create(assets.image`
    Trip Games
    `, SpriteKind.Food)
tripgameslogo.setScale(2.5, ScaleAnchor.Middle)
scene.setBackgroundColor(12)
pause(3)
game.setDialogFrame(img`
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
    `)
game.showLongText("Şehrimiz uzun bir zamandır verimsiz enerji kirliliğinde.", DialogLayout.Bottom)
game.showLongText("Hava kirliliği ve elektrik kesintileri", DialogLayout.Bottom)
game.showLongText("Halkı mutsuz ediyordu.", DialogLayout.Bottom)
game.showLongText("Bu olumsuz durumu düzeltmek için belediyemiz...", DialogLayout.Bottom)
game.showLongText("SENİ görevlendirdi.", DialogLayout.Bottom)
game.showLongText("Halkımızı yüzüstü bırakma...", DialogLayout.Bottom)
game.showLongText("TriPower Efeler bir Trip Games GameJam projesi", DialogLayout.Bottom)
sprites.destroyAllSpritesOfKind(SpriteKind.Food)
//  ─────────────────────────────────────────
//  OYUNCU OLUŞTURMA & HARİTA YÜKLEME
//  ─────────────────────────────────────────
player2 = sprites.create(img`
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
        `, SpriteKind.Player)
tiles.setCurrentTilemap(tilemap`
    level1
    `)
scene.cameraFollowSprite(player2)
game.showLongText("Şehir verimsiz enerji kaynakları kullanıyor.", DialogLayout.Bottom)
game.showLongText("Bu durumu düzeltmek senin elinde.", DialogLayout.Bottom)
game.showLongText("Verimsiz enerji kaynaklarını...", DialogLayout.Bottom)
game.showLongText("Temizleri ile değiştir.", DialogLayout.Bottom)
game.showLongText("Enerji kaynaklarını eklemek için sanayi bölgesindeki alanların üzerine gel", DialogLayout.Center)
game.splash("B = Değiştirme menüsü")
game.splash("A = Tile hakkında bilgi")
//  ─────────────────────────────────────────
//  HAREKET
//  ─────────────────────────────────────────
game.onUpdate(function on_on_update() {
    
    if (controller.right.isPressed()) {
        if (vx < 0) {
            vx = 0.5
        }
        
        vx += 10
    } else if (controller.left.isPressed()) {
        if (vx > 0) {
            vx = -0.5
        }
        
        vx += 0 - 10
    } else {
        vx *= 0.7
    }
    
    if (controller.up.isPressed()) {
        if (vy > 0) {
            vy = -0.5
        }
        
        vy += 0 - 10
    } else if (controller.down.isPressed()) {
        if (vy < 0) {
            vy = 0.5
        }
        
        vy += 10
    } else {
        vy *= 0.7
    }
    
    vx = Math.constrain(vx, -200, 200)
    vy = Math.constrain(vy, -200, 200)
    player2.vx = vx
    player2.vy = vy
})
//  ─────────────────────────────────────────
//  PARA / SKOR
//  ─────────────────────────────────────────
game.onUpdate(function on_on_update2() {
    
    pause(1)
    para += 0.005 * happiness
    info.setScore(para)
    if (happiness >= 150 && para >= 40000) {
        game.setGameOverEffect(true, effects.confetti)
        game.setGameOverMessage(true, "BAŞARDIN!")
        game.setGameOverPlayable(true, music.melodyPlayable(music.powerUp), false)
        game.gameOver(true)
    }
    
})
