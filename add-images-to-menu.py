#!/usr/bin/env python3
import os
import re
from pathlib import Path

# Mapping of product names to image filenames
image_mapping = {
    'Affogato': 'affogato.jpeg',
    'African coffee': 'african coffee.jpeg',
    'Babyccino': 'babayccino.jpeg',
    'Caffè Latte': 'caffee_latte.jpeg',
    'Caffè au Lait': 'Caffè_au_Lait.jpeg',
    'Caffè Mocha': 'caffe_mocha.jpeg',
    'Cappuccino': 'cappuccino.jpeg',
    'Cortado': 'Cortado.jpeg',
    'Flatwhite': 'Flat_White.jpeg',
    'Piccolo': 'Picollo.jpeg',
    'Espresso Tonic': 'Espresso_Tonic.jpeg',
    'Espresso Romano': 'espresso_romano.jpeg',
    'Espresso Macchiato': 'Espresso_Macchiato.jpeg',
    'Spanish Latte': 'Spanish_Latte.jpeg',
    'Calumera Latte': 'calumera_latte.jpeg',
    'Frappuccino': 'Frapuccini.jpeg',
    'Raf Latte': 'Raf_Latte.jpeg',
    'Hot Chocolate': 'Hot_Chocolate.jpeg',
    'Americano': 'Americano.jpeg',
    'Long Black': 'Long_Black.jpeg',
    'Red Eye': 'Red_Eye.jpeg',
    'Black Eye': 'Black_Eye.jpeg',
    'Iced Black Eye': 'Iced_Black_Eye.jpeg',
    'Iced Red Eye': 'Iced_Red_Eye.jpeg',
    'Iced Long Black': 'Iced_Long_Black.jpeg',
    'Iced Americano': 'Iced_Americano.jpeg',
    'Black tea': 'Black_Tea.jpeg',
    'Green tea': 'Green_Tea.jpeg',
    'African tea': 'African_Tea.jpeg',
    'Spiced tea': 'Spiced_Tea.jpeg',
    'Chocolate milkshake': 'Chocolate_Milkshake.jpeg',
    'Vanilla milkshake': 'Vanilla_Milkshake.jpeg',
    'Strawberry milkshake': 'Strawberry_Milkshake.jpeg',
    'Fruit milkshake': 'Fruit_Milkshake.jpeg',
    'Mix juice': 'Mix_Juice.jpeg',
    'Tropical juice': 'Tropical_Juice.jpeg',
    'Exotic juice': 'Exotic_Juice.jpeg',
    'Banana mango smoothie': 'Banana_Mango_Smoothie.jpeg',
    'Avocado Mango smoothie': 'Avocado_Berry_Smoothie.jpeg',
    'Banana yoghurt smoothie': 'Banana_Yogurt_Smoothie.jpeg',
    'Choco Peanut Smoothie': 'Choco_Peanut_Smoothie.jpeg',
    'French press': 'french_press.jpeg',
    'Aero-press': 'aero_press.jpeg',
    'Moka pot': 'moka_pot.jpeg',
    'Cold brew': 'cold_brew.jpeg',
    'V60': 'v60.jpeg',
    'Chemex': 'chemex.jpeg',
    'Egg coffee': 'egg_coffee.jpeg',
    'Mango coffee': 'mango_coffee.jpeg',
    'Avocado coffee': 'avocado_coffee.jpeg',
    'Babana coffee': 'banana_coffee.jpeg',
    'Frappe': 'frappe.jpeg',
}

# Read the menu.html file
with open('menu.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace each menu-item without data-image
for product_name, image_file in image_mapping.items():
    # Find and replace menu-item divs without data-image attribute
    pattern = f'<div class="menu-item">\s*<span class="item-name">{re.escape(product_name)}</span>'
    replacement = f'<div class="menu-item" data-image="{image_file}">\n                         <span class="item-name">{product_name}</span>'
    content = re.sub(pattern, replacement, content)

# Write the updated content back
with open('menu.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Successfully added image data attributes to menu items!")
