# Portraits

Each person is one codex `image_gen` call that makes one 1536×1024 sheet: four ages down
(child, young, mid, old), five moods across (happy, neutral, sad, angry, scared). `slice.sh`
cuts it into `assets/face-<id>-<age>-<mood>.webp`.

- `new.sh <ids>` draws people from their line in `people.txt` (`<id> <f|m|any> <description>`).
- `redraw.sh <ids>` redraws a person seeded from their existing portrait, for a sheet where the
  ages blurred or grey hair and beards reached the young rows.
- `fix.sh <id> <age|mood> "<what went wrong>"` redraws one row or column, seeded from the current panels.
- `slice.sh [ids]` cuts sheets into panels along the gutters it finds, and warns if one still shows.
- `prompt.sh` holds the age, mood and style text all three draw scripts share. Fix a prompt there.

Run them one at a time: codex doesn't say which file it wrote, so each sheet is taken as the
newest image since the run started. Look over every sheet before slicing.

After slicing, raise `FACES` in `js/ds/data.js` and add women to `FACE_F` (and anyone who reads
as either to `FACE_ANY`) so names match.
