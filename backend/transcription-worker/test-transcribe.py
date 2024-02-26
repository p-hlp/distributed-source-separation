import whisper
import asyncio


async def main():
    modle_name = "small.en"
    print(f"Loading model {modle_name}...")

    model = whisper.load_model(modle_name)
    audio = whisper.load_audio("test.wav")
    print(f"Audio shape: {audio.shape}")

    # Check if model_name ends with .en
    if not modle_name.endswith(".en"):
        _, probs = model.detect_language(audio)
        print(f"Detected language: {max(probs, key=probs.get)}")

    result = model.transcribe(audio)
    print(result["text"])


if __name__ == "__main__":
    asyncio.run(main())
