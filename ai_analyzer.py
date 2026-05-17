import sys
import json
import difflib

def main():
    # Read from stdin
    input_data = sys.stdin.read()
    if not input_data:
        return
        
    try:
        data = json.loads(input_data)
        spoken_text = data.get('spoken_text', '')
        target_text = data.get('target_text', '')
        
        # Calculate similarity
        matcher = difflib.SequenceMatcher(None, spoken_text.lower(), target_text.lower())
        similarity = matcher.ratio()
        
        score = int(similarity * 100)
        
        feedback = "Excellent pronunciation!" if score >= 80 else "Keep practicing!"
        
        result = {
            "status": "success",
            "score": score,
            "feedback": feedback
        }
        
        # Output to stdout
        print(json.dumps(result))
        
    except Exception as e:
        print(json.dumps({"status": "error", "message": str(e)}))

if __name__ == '__main__':
    main()
