import os
from flask import Flask, render_template, request, send_file, redirect, url_for
from moviepy.editor import VideoFileClip, AudioFileClip, concatenate_videoclips

app = Flask(__name__)

# Folders
VIDEO_FOLDER = "static/videos"
AUDIO_FOLDER = "static/audio"
OUTPUT_FOLDER = "static/output"

# Make sure folders exist
for folder in [VIDEO_FOLDER, AUDIO_FOLDER, OUTPUT_FOLDER]:
    os.makedirs(folder, exist_ok=True)

app.config["VIDEO_FOLDER"] = VIDEO_FOLDER
app.config["AUDIO_FOLDER"] = AUDIO_FOLDER
app.config["OUTPUT_FOLDER"] = OUTPUT_FOLDER
app.config["MAX_CONTENT_LENGTH"] = 500 * 1024 * 1024  # 500MB limit

@app.route("/", methods=["GET"])
def home():
    # Show uploaded videos
    videos = os.listdir(VIDEO_FOLDER)
    return render_template("index.html", videos=videos)

@app.route("/upload-video", methods=["POST"])
def upload_video():
    if "video" not in request.files:
        return "No file part", 400
    file = request.files["video"]
    if file.filename == "":
        return "No selected file", 400
    path = os.path.join(VIDEO_FOLDER, file.filename)
    file.save(path)
    return redirect("/")

@app.route("/upload-audio", methods=["POST"])
def upload_audio():
    if "audio" not in request.files:
        return "No file part", 400
    file = request.files["audio"]
    if file.filename == "":
        return "No selected file", 400
    path = os.path.join(AUDIO_FOLDER, file.filename)
    file.save(path)
    return redirect("/")

@app.route("/render", methods=["POST"])
def render_video():
    selected_videos = request.form.getlist("videos")
    audio_file = request.form.get("audio")

    if not selected_videos or not audio_file:
        return "Select videos and audio", 400

    # Load video clips
    clips = []
    for v in selected_videos:
        clip = VideoFileClip(os.path.join(VIDEO_FOLDER, v)).resize(width=360)
        clips.append(clip)

    final_video = concatenate_videoclips(clips, method="compose")

    # Load audio
    audio_path = os.path.join(AUDIO_FOLDER, audio_file)
    audio = AudioFileClip(audio_path)
    final_video = final_video.set_audio(audio)

    output_path = os.path.join(OUTPUT_FOLDER, "final_video.mp4")
    final_video.write_videofile(output_path, fps=24, codec="libx264", audio_codec="aac", threads=1, logger=None)

    return send_file(output_path, as_attachment=True)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
