from PIL import Image
import os

# Create output directory
output_dir = "public/images/moonphases"
os.makedirs(output_dir, exist_ok=True)

# Open the sprite sheet
sprite_sheet = Image.open("public/images/moonphases.png")

# Get the width of a single frame (total width / number of frames)
frame_width = sprite_sheet.width // 22
frame_height = sprite_sheet.height

# Split into individual frames
for i in range(22):
    left = i * frame_width
    right = left + frame_width
    frame = sprite_sheet.crop((left, 0, right, frame_height))
    
    # Save frame with transparency
    frame.save(f"{output_dir}/frame{i}.png", "PNG")

print("Frames extracted successfully!") 