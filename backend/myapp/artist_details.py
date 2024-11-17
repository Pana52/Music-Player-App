import os
import json
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Create OpenAI client instance
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
if not client.api_key:
    raise ValueError("Missing OpenAI API key! Please set it in the .env file.")

# Set the root directory for your project explicitly
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../"))  # Moves up two levels to reach root
ARTIST_DATA_DIR = os.path.join(ROOT_DIR, "media", "artist")

# Ensure the artist data directory exists
os.makedirs(ARTIST_DATA_DIR, exist_ok=True)


def get_artist_details(artist_name):
    """
    Fetches or retrieves artist details and saves them as a JSON file.
    Returns the artist details as a dictionary.
    """
    file_name = f"{artist_name.replace(' ', '_')}.json"
    file_path = os.path.join(ARTIST_DATA_DIR, file_name)

    # Check if the file already exists
    if os.path.exists(file_path):
        with open(file_path, "r") as file:
            print(f"Using cached details for {artist_name}")
            return json.load(file)

    # File doesn't exist: Fetch details from OpenAI
    print(f"Fetching new details for {artist_name}")
    artist_details = fetch_artist_details(artist_name)

    # Save the artist details to a JSON file
    with open(file_path, "w") as file:
        json.dump(artist_details, file, indent=4)

    return artist_details


def fetch_artist_details(artist_name):
    """
    Fetch artist details using OpenAI's API with enhanced response parsing.
    """
    try:
        # Prepare the structured prompt
        prompt = f"""
        Provide detailed information about the artist {artist_name} in JSON format. The JSON should include:
        - "artistBio": A brief biography of the artist.
        - "discography": A list of albums, each with a "name" and "release_date".
        - "socialLinks": Links to the artist's official Spotify, YouTube, and Twitter accounts.
        Example structure:
        {{
            "artistBio": "Biography of the artist.",
            "discography": [
                {{"name": "Album 1", "release_date": "2020"}},
                {{"name": "Album 2", "release_date": "2021"}}
            ],
            "socialLinks": {{
                "spotify": "https://spotify.com/",
                "youtube": "https://youtube.com/",
                "twitter": "https://twitter.com/"
            }}
        }}
        """

        # Log the prompt being sent
        print(f"Sending OpenAI API request with the following prompt:\n{prompt}")

        # Call OpenAI API with the new client instance
        response = client.chat.completions.create(
            model="gpt-4o-mini",  # Replace with your correct model name
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=500,
            temperature=0.7
        )

        # Log raw response
        print(f"Received raw response from OpenAI API:\n{response}")

        # Extract the content from the assistant's message
        generated_text = response.choices[0].message.content.strip()
        print(f"Generated response content:\n{generated_text}")

        # Extract JSON from the response content
        json_start = generated_text.find("{")
        json_end = generated_text.rfind("}") + 1
        if json_start == -1 or json_end == -1:
            raise ValueError("JSON block not found in the response content.")

        json_content = generated_text[json_start:json_end]

        # Parse the JSON content
        artist_details = json.loads(json_content)  # Convert JSON string to Python dictionary
        return artist_details

    except json.JSONDecodeError as jde:
        # Log JSON parsing errors
        print(f"Error parsing JSON response for {artist_name}: {jde}")
        print(f"Problematic response content:\n{generated_text}")
        return {
            "artistBio": f"Could not parse details for {artist_name}.",
            "discography": [],
            "socialLinks": {
                "spotify": None,
                "youtube": None,
                "twitter": None
            }
        }
    except ValueError as ve:
        # Log errors when JSON block cannot be located
        print(f"Error extracting JSON block for {artist_name}: {ve}")
        print(f"Problematic response content:\n{generated_text}")
        return {
            "artistBio": f"Could not extract details for {artist_name}.",
            "discography": [],
            "socialLinks": {
                "spotify": None,
                "youtube": None,
                "twitter": None
            }
        }
    except client.error.APIError as oae:
        # Log OpenAI API errors
        print(f"OpenAI API error for {artist_name}: {oae}")
        return {
            "artistBio": f"OpenAI API error occurred while fetching details for {artist_name}.",
            "discography": [],
            "socialLinks": {
                "spotify": None,
                "youtube": None,
                "twitter": None
            }
        }
    except Exception as e:
        # Log unexpected errors
        print(f"Unexpected error for {artist_name}: {e}")
        return {
            "artistBio": f"An unexpected error occurred while fetching details for {artist_name}.",
            "discography": [],
            "socialLinks": {
                "spotify": None,
                "youtube": None,
                "twitter": None
            }
        }




if __name__ == "__main__":
    # Example usage for testing
    test_artist = "Tally Hall"
    details = get_artist_details(test_artist)
    print(f"Details for {test_artist}: {json.dumps(details, indent=4)}")
