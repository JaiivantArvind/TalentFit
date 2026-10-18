import os
from app import app

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    print(f"TalentFit Backend running on http://0.0.0.0:{port}", flush=True)
    app.run(host='0.0.0.0', port=port, debug=False)