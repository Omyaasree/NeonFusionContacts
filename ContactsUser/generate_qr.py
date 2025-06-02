# # code for image generation 

import segno


# Generate QR with a Kiki-themed message

url = "https://neon-fusion-contacts-s2wc.vercel.app/"
qr_kiki = segno.make_qr(url)


qr_kiki.save(
    "neonFusionContactsApp.png",
    scale=7,
    border=2,
    dark="#00796B",    # Deep navy blue, like Kiki's dress
    light="#fdf6e3",   # Soft cream, vintage-style background
    finder_dark="#FFC107",  # A touch of Kiki's red bow
    finder_light="#fdf6e3",  # Match background for harmony
)

