import json
import os
import requests
from bs4 import BeautifulSoup
import re

defaultImage = "D:\\Music-Player-App\\frontend\\my-app\\public\\default-album-cover.png"
genius_search_url = "https://genius.com/api/search/multi"

# Function to search Genius.com for an album
def search_genius(artist_name, album_name):
    try:
        # Perform a search query
        response = requests.get(
            genius_search_url,
            params={"q": f"{artist_name} {album_name}"},
            headers={"User-Agent": "Mozilla/5.0"}
        )
        response.raise_for_status()
        search_results = response.json()

        # Look for album results
        for section in search_results.get("response", {}).get("sections", []):
            if section["type"] == "album":
                for hit in section["hits"]:
                    # Check if the hit matches the artist name
                    if artist_name.lower() in hit["result"]["artist"]["name"].lower():
                        return hit["result"]["url"]
    except Exception as e:
        print(f"Error searching Genius.com for {album_name}: {e}")
    return None  # Return None if no URL is found

# Scrape album cover
def scrape_album_cover(album_url):
    try:
        response = requests.get(album_url)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')
        cover_img_tag = soup.find('img', class_="cover_art-image")
        if cover_img_tag and cover_img_tag.get('src'):
            return cover_img_tag['src']
    except Exception as e:
        print(f"Error scraping {album_url}: {e}")
    return defaultImage

# Update JSON with album cover URLs
def update_discography_with_covers(json_file):
    with open(json_file, 'r') as file:
        artist_data = json.load(file)

    artist_name = os.path.basename(json_file).replace('.json', '').replace('_', ' ')
    
    for album in artist_data.get('discography', []):
        print(f"Processing album: {album['name']}")
        album_url = search_genius(artist_name, album['name'])

        if album_url:
            print(f"Found URL for {album['name']}: {album_url}")
            album['coverImage'] = scrape_album_cover(album_url)
        else:
            print(f"No URL found for {album['name']}. Using default image.")
            album['coverImage'] = defaultImage

    # Debug: Confirm coverImage is updated
    print(f"Updated cover image for {album['name']}: {album['coverImage']}")


    # Overwrite the existing JSON file
    with open(json_file, 'w') as file:
        json.dump(artist_data, file, indent=4)
    print(f"Updated JSON saved at {json_file}")


if __name__ == "__main__":
    json_file_path = r"D:\Music-Player-App\media\artist\Tally_Hall.json"
    if os.path.exists(json_file_path):
        update_discography_with_covers(json_file_path)
    else:
        print(f"File not found: {json_file_path}")
