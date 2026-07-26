# Badge Web Controller

Browser-based controller for the smart badge — connects directly over USB using the WebSerial API, no app or drivers required.

## Status
✅ Fully functional against firmware — connect, control, and disconnect all working

![Status](https://img.shields.io/badge/status-working-brightgreen)

## Working Features
- Connect/disconnect via WebSerial with graceful error handling
- Live effect selection (steady / wave / pulse)
- Brightness control via slider
- Real-time status display

## Structure
- index.html — page structure
- css/style.css — styling
- js/main.js — WebSerial logic and command protocol

## Browser Support
Chrome or Edge only (WebSerial is not supported in Safari or Firefox)

## Related repos
- badge-pcb — hardware
- badge-firmware — firmware this communicates with

## License

![License](https://img.shields.io/badge/license-MIT-blue)
