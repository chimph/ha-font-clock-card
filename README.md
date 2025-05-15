# Font Clock Card
![Version](https://img.shields.io/badge/Version-v1.0.0-ff1493?style=for-the-badge&logo=star&logoColor=white&labelColor=0a0a0a)

A Home Assistant Lovelace card that displays a clock using any [Google Font](https://fonts.google.com/). Fully customizable with font name, size, weight, colour, and 12h/24h formats.

![Font Clock Card(1)](https://github.com/user-attachments/assets/474569cb-722d-4445-8c93-5cc5da439911)


## Features

- Display current time in 12h or 24h format
- Choose any Google Font and font weight
- Customize size and colour
- Position Left, Centre or Right
- Visual editor for Lovelace
- Optional: remove space before AM/PM

## Installation

### HACS (Recommended)
1. Open HACS
2. Go to "Frontend" section
3. Click on the three dots in the top right corner
4. Select "Custom repositories"
5. Add this repository URL (https://github.com/chimph/ha-font-clock-card)
6. Click "Add"
7. Search for "Font Clock Card" and install it

### Manual

1. Download `font-clock-card.js`.
2. Place it in `www/community/font-clock-card/` inside your Home Assistant config folder.
3. Go to Configuration → Dashboards → Three Dot Menu - Resources → Add Resource → Set Url as /local/community/font-clock-card/font-clock-card.js → Set Resource type as JavaScript Module → Create

## Usage
Add to Dashboard via the Visual Editor (search Font Clock Card) or with YAML. Browse Google Fonts for something that suits your dashboard vision. Be creative!

![Screenshot 2025-05-15 161411](https://github.com/user-attachments/assets/25ec7a59-c853-436d-ac1a-2ad1b89af043)

Above example in yaml (time format and position as default):
```yaml
type: custom:font-clock-card
font_name: Orbitron
font_weight: "700"
font_size: 150px
format: HH:mm
color: cyan
```

The card will render the default clock when just using:
```yaml
type: custom:font-clock-card
```

