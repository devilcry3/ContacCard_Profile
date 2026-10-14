"""Generate a real QR for the deployed URL, with a small center logo.
Run: python -m pip install qrcode[pil] pillow
     python generate_qr.py https://USERNAME.github.io/REPO/
Then set cardUrl to that URL in config.js.
"""
import sys
from pathlib import Path
import qrcode
from PIL import Image
if len(sys.argv)!=2 or not sys.argv[1].startswith('https://'):
    raise SystemExit('Usage: python generate_qr.py https://YOUR-PUBLISHED-CARD-URL/')
root=Path(__file__).parent
qr=qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_H,box_size=12,border=4)
qr.add_data(sys.argv[1]);qr.make(fit=True)
img=qr.make_image(fill_color='#171a19',back_color='#faf3e3').convert('RGB')
# Logo is displayed by the web page overlay, preserving the underlying QR.
img.save(root/'assets'/'qr-code.png')
print('Generated assets/qr-code.png for:',sys.argv[1])
