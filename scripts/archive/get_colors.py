import cv2
import numpy as np
from collections import Counter

def get_dominant_colors(image_path, k=5):
    img = cv2.imread(image_path)
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    img = img.reshape((img.shape[0] * img.shape[1], 3))
    
    # Use KMeans or just simple counting for exact UI colors
    # Actually, let's just pick specific coordinates if we know the layout.
    return True

