"""Hace importable el paquete ``app`` desde la carpeta backend/."""

import os
import sys

# Añade backend/ al sys.path para poder hacer ``from app ... import``.
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
