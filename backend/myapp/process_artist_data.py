import os
import json
from .artist_details import get_artist_details
from .scrape_album_covers import update_discography_with_covers

def process_artist_data(artist_name):
    # Define the correct media/artist directory relative to the project root
    ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../"))  # Moves up two levels
    ARTIST_DATA_DIR = os.path.join(ROOT_DIR, "media", "artist")  # Correct path to media/artist

    # Ensure the artist data directory exists
    os.makedirs(ARTIST_DATA_DIR, exist_ok=True)

    try:
        # Step 1: Fetch artist details
        json_file_name = f"{artist_name.replace(' ', '_')}.json"
        json_file_path = os.path.join(ARTIST_DATA_DIR, json_file_name)
        print(f"Processing artist data for {artist_name}. JSON file path: {json_file_path}")

        artist_details = get_artist_details(artist_name)

        # Save the artist details to the correct JSON file
        with open(json_file_path, "w") as file:
            json.dump(artist_details, file, indent=4)

        # Step 3: Update album covers
        update_discography_with_covers(json_file_path)
        print(f"Finished updating album covers for {artist_name}")

    except Exception as e:
        print(f"Error processing artist data: {e}")
