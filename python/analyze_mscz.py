from fastapi import APIRouter, UploadFile, File
from music21 import converter

router = APIRouter(prefix="/analyze_mscz", tags=["Analyze MSCZ"])

@router.post("/")
async def analyze_mscz(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        temp_path = f"/tmp/{file.filename}"
        with open(temp_path, "wb") as f:
            f.write(contents)

        score = converter.parse(temp_path)
        key = score.analyze("key")
        time_sig = score.recurse().getElementsByClass("TimeSignature")[0].ratioString
        measures = len(score.parts[0].getElementsByClass("Measure"))
        chords = [c for c in score.chordify().recurse().getElementsByClass("Chord")]
        chord_names = [c.commonName for c in chords[:16]]

        return {
            "filename": file.filename,
            "key": str(key),
            "time_signature": time_sig,
            "measures": measures,
            "sample_chords": chord_names,
            "status": "success"
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}
