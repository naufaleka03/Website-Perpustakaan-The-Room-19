# Load User Preferences CSV
import pandas as pd
from sklearn.preprocessing import MultiLabelBinarizer, OneHotEncoder
from sklearn.metrics.pairwise import cosine_similarity
import ast
import psycopg2
import re

# --- Data Loading and Preprocessing ---

def load_user_data():
    try:
        user_df = pd.read_csv("data/user_preferences.csv", sep=';', on_bad_lines='warn', encoding="latin-1")
    except UnicodeDecodeError:
        user_df = pd.read_csv("data/user_preferences.csv", sep=';', on_bad_lines='warn', encoding="ISO-8859-1")
    return user_df

def load_books_data():
    try:
        books_df = pd.read_csv("data/books_dataset.csv", sep=';', on_bad_lines='warn', encoding="latin-1")
    except UnicodeDecodeError:
        books_df = pd.read_csv("data/books_dataset.csv", sep=';', on_bad_lines='warn', encoding="ISO-8859-1")
    return books_df

user_df = load_user_data()
books_df = load_books_data()

# Convert {...} string fields to Python sets/lists
user_df['favorite_genres'] = user_df['favorite_genres'].str.strip('{}').str.split(',')
user_df['preferred_formats'] = user_df['preferred_formats'].str.strip('{}').str.split(',')
user_df['preferred_book_types'] = user_df['preferred_book_types'].str.strip('{}').str.split(',')
user_df['desired_feelings'] = user_df['desired_feelings'].str.strip('{}').str.split(',')
user_df['disliked_genres'] = user_df['disliked_genres'].str.strip('{}').str.split(',')

# Language mapping
language_map = {
    'indonesian': 'Indonesia',
    'english': 'Inggris',
    'other' : 'Other'
}
user_df['language'] = user_df['preferred_language'].map(language_map).fillna(user_df['preferred_language'])

# Book type mapping
book_type_map = {
    'fiction': 'Fiction',
    'non-fiction': 'Nonfiction'
}
user_df['content_type'] = user_df['preferred_book_types'].apply(
    lambda x: [book_type_map.get(i.strip(), i.strip().title()) for i in x] if isinstance(x, list) and x != [''] else []
)

# Cover type mapping
cover_type_map = {
    'paperback': 'Paperback',
    'hardcover': 'Hardcover',
    'ebook': 'Ebook',
    'audiobook': 'Audiobook'
}
user_df['cover_type'] = user_df['preferred_formats'].apply(
    lambda x: [cover_type_map.get(i.strip(), i.strip().title()) for i in x] if isinstance(x, list) and x != [''] else []
)

# Genre mapping
genre_map = {
    'arts_architecture': 'Arts & Architecture',
    'business': 'Business',
    "children_book": "Children's Books",
    'chinese_literature': 'Chinese Literature',
    'climate_change': 'Climate Change',
    'colonialism': 'Colonialism',
    'crc_fict': 'Colonialism, Race, Class (Fict.)',
    'crime_mystery': "Crime & Mystery",
    'critiques_capitalism': 'Critiques on Capitalism',
    'dystopian_postapocalyptic': 'Dystopian & Post-Apocalyptic',
    'education': 'Education',
    'family': 'Family',
    'fantasy_scifi': 'Fantasy & Sci-Fi',
    'feminism': 'Feminism',
    'graphic_novels': 'Graphic Novels',
    'historical_fiction': 'Historical Fiction',
    'history': 'History',
    'indonesian_literature': 'Indonesian Literature',
    'japanese_literature': 'Japanese Literature',
    'korean_literature': 'Korean Literature',
    'literacy_criticalism': 'Literacy Criticalism',
    'magazine_zine': 'Magazine & Zine',
    'memoirs_biography': 'Memoirs & Biography',
    'natural_science': 'Natural Science',
    'on_womanhood': 'On Womanhood',
    'other_people': "Other People's Book",
    'pets': 'Pets!',
    'philosophy': 'Philosophy',
    'poetry_literacy': 'Poetry & Literacy Criticism',
    'politics_sociology': 'Politics & Sociology',
    'psychology_selfhelp': 'Psychology & Self Help',
    'religions': 'Religions',
    'romance': 'Romance',
    'russian_literature': 'Russian Literature',
    'science': 'Science',
    'self_discovery': 'Self Discovery',
    'self_help': 'Self Help',
    'travel': 'Travel',
    'western_classic_lit': 'Western Classic Lit.',
    'western_classics': 'Western Classics',
    'western_contemporary': 'Western Contemporary Lit.',
    'world_literature': 'World Literature'
}
user_df['genre'] = user_df['favorite_genres'].apply(
    lambda x: [genre_map.get(i.strip(), i.strip().replace('_', ' ').title()) for i in x] if isinstance(x, list) and x != [''] else []
)

user_df.drop(columns=['preferred_language', 'preferred_book_types', 'preferred_formats', 'favorite_genres'], inplace=True)

fields = ['genre', 'cover_type', 'content_type']
for field in fields:
    user_df[field] = user_df[field].apply(lambda x: [] if x == [''] else x)

mlb_fields = {}
for field in fields:
    user_df[field] = user_df[field].apply(lambda x: [] if not isinstance(x, list) else x)
    mlb = MultiLabelBinarizer()
    transformed = mlb.fit_transform(user_df[field])
    mlb_df = pd.DataFrame(transformed, columns=[f'{field}_{cls}' for cls in mlb.classes_])
    mlb_df.index = user_df.index
    user_df = pd.concat([user_df, mlb_df], axis=1)
    mlb_fields[field] = mlb

user_df = pd.get_dummies(user_df, columns=['language'])

user_features_df = user_df.drop(columns=[
    'genre', 'age_group', 'education_level', 'cover_type', 'content_type', 'city',
    'reading_frequency', 'reading_time_availability', 'reader_type', 'reading_habits',
    'desired_feelings', 'disliked_genres'
])

# --- Book Data Preprocessing ---
def safe_parse_themes(x):
    if isinstance(x, str):
        try:
            return ast.literal_eval(x)
        except Exception:
            return []
    return []
books_df['themes'] = books_df['themes'].apply(safe_parse_themes)

categorical_cols = ['language', 'cover_type', 'content_type', 'genre']
one_hot_encoded = pd.get_dummies(books_df[categorical_cols], prefix=categorical_cols)

book_features_df = pd.concat([books_df[['id', 'book_title']], one_hot_encoded], axis=1)

books_df = book_features_df.copy().reset_index(drop=True)
users_df = user_features_df.copy().reset_index(drop=True)

book_ids = books_df['id'].values
user_ids = users_df['id'].values

books_features = books_df.drop(columns=['id', 'book_title'], errors='ignore')
users_features = users_df.drop(columns=['id'], errors='ignore')

all_feature_columns = sorted(set(books_features.columns).union(set(users_features.columns)))
books_aligned = books_features.reindex(columns=all_feature_columns, fill_value=0)
users_aligned = users_features.reindex(columns=all_feature_columns, fill_value=0)

books_vector = books_aligned.copy()
books_vector['id'] = book_ids
users_vector = users_aligned.copy()
users_vector['id'] = user_ids

books_vector.set_index('id', inplace=True)
users_vector.set_index('id', inplace=True)

users_vector = users_vector.astype(float)
books_vector = books_vector.astype(float)

book_titles = books_df.set_index('id')['book_title'].to_dict()

# --- Similarity Calculation ---
similarity_matrix = cosine_similarity(users_vector.values, books_vector.values)
similarity_df = pd.DataFrame(
    similarity_matrix,
    index=users_vector.index,
    columns=books_vector.index
)

def get_recommendations_for_user(pref_id, top_n=5):
    print(user_df.head())
    print('Looking for id:', pref_id)
    user_prefs = user_df[user_df['id'] == pref_id]
    print('user_prefs found:', not user_prefs.empty)
    if user_prefs.empty:
        print('No user found for id:', pref_id)
        return []
    if pref_id not in similarity_df.index:
        return []
    top_books = similarity_df.loc[pref_id].sort_values(ascending=False).head(top_n)
    print('user_prefs:', user_prefs)
    recommended_books = [
        {"book_id": int(book_id), "book_title": book_titles.get(book_id, "Unknown Title")}
        for book_id in top_books.index
    ]
    print('Recommendations:', recommended_books)
    return recommended_books

def get_user_preferences_from_db(pref_id):
    conn = psycopg2.connect("your_postgres_connection_string")
    cur = conn.cursor()
    cur.execute("SELECT * FROM preferences WHERE id = %s", (pref_id,))
    row = cur.fetchone()
    cur.close()
    conn.close()
    # Convert row to dict as needed
    return row

user_df['id'] = user_df['id'].astype(str)

