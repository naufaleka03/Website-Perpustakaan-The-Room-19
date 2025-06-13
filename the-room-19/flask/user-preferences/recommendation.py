# Load User Preferences CSV
import pandas as pd
from sklearn.preprocessing import MultiLabelBinarizer, OneHotEncoder
from sklearn.metrics.pairwise import cosine_similarity
import ast
from db import Preference

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
book_feature_columns = [col for col in books_vector.columns if col != 'id']

user_vector = (
    user_features_df
    .drop(columns=['id'], errors='ignore')
    .reindex(columns=book_feature_columns, fill_value=0)
    .values.astype(float)
)
book_vectors = books_vector.drop(columns=['id'], errors='ignore').values.astype(float)

print("user_vector shape:", user_vector.shape)
print("book_vectors shape:", book_vectors.shape)
print("book_feature_columns:", book_feature_columns)

similarity_matrix = cosine_similarity(users_vector.values, books_vector.values)

similarity_df = pd.DataFrame(
    similarity_matrix,
    index=users_vector.index,
    columns=books_vector.index
)

print("users_vector shape:", users_vector.shape)
print("books_vector shape:", books_vector.shape)
print("similarity_matrix shape:", similarity_df.shape)
print("users_vector.index:", users_vector.index)
print("books_vector.index:", books_vector.index)

def get_recommendations_for_user(pref_id, top_n=5):
    print(f"[LOG] Received pref_id: {pref_id}")
    user_prefs = get_user_preferences_from_db(pref_id)
    if not user_prefs:
        print(f"[LOG] No user found for id: {pref_id}")
        return []

    print(f"[LOG] Raw user_prefs from DB: {user_prefs}")

    # Transform DB user_prefs dict to a DataFrame row matching user_df columns
    # Fill missing fields with empty string or empty list as appropriate
    user_row = {
        'id': str(user_prefs.get('id', '')),
        'age_group': user_prefs.get('age_group', ''),
        'education_level': user_prefs.get('education_level', ''),
        'city': user_prefs.get('city', ''),
        'preferred_language': user_prefs.get('preferred_language', ''),
        'reading_frequency': user_prefs.get('reading_frequency', ''),
        'reading_time_availability': user_prefs.get('reading_time_availability', ''),
        'reader_type': user_prefs.get('reader_type', ''),
        'reading_habits': user_prefs.get('reading_habits', ''),
        'favorite_genres': user_prefs.get('favorite_genres', []),
        'preferred_book_types': user_prefs.get('preferred_book_types', []),
        'preferred_formats': user_prefs.get('preferred_formats', []),
        'desired_feelings': user_prefs.get('desired_feelings', []),
        'disliked_genres': user_prefs.get('disliked_genres', []),
    }
    print(f"[LOG] user_row before DataFrame: {user_row}")

    # Create a DataFrame for this user
    user_df_db = pd.DataFrame([user_row])

    # Apply the same preprocessing as for the CSV
    user_df_db['favorite_genres'] = user_df_db['favorite_genres'].apply(lambda x: [i.strip() for i in x] if isinstance(x, list) else [])
    user_df_db['preferred_formats'] = user_df_db['preferred_formats'].apply(lambda x: [i.strip() for i in x] if isinstance(x, list) else [])
    user_df_db['preferred_book_types'] = user_df_db['preferred_book_types'].apply(lambda x: [i.strip() for i in x] if isinstance(x, list) else [])
    user_df_db['desired_feelings'] = user_df_db['desired_feelings'].apply(lambda x: [i.strip() for i in x] if isinstance(x, list) else [])
    user_df_db['disliked_genres'] = user_df_db['disliked_genres'].apply(lambda x: [i.strip() for i in x] if isinstance(x, list) else [])

    # Language mapping
    user_df_db['language'] = user_df_db['preferred_language'].map(language_map).fillna(user_df_db['preferred_language'])

    # Book type mapping
    user_df_db['content_type'] = user_df_db['preferred_book_types'].apply(
        lambda x: [book_type_map.get(i.strip(), i.strip().title()) for i in x] if isinstance(x, list) and x != [''] else []
    )

    # Cover type mapping
    user_df_db['cover_type'] = user_df_db['preferred_formats'].apply(
        lambda x: [cover_type_map.get(i.strip(), i.strip().title()) for i in x] if isinstance(x, list) and x != [''] else []
    )

    # Genre mapping
    user_df_db['genre'] = user_df_db['favorite_genres'].apply(
        lambda x: [genre_map.get(i.strip(), i.strip().replace('_', ' ').title()) for i in x] if isinstance(x, list) and x != [''] else []
    )

    # Drop columns to match the original pipeline
    user_df_db.drop(columns=['preferred_language', 'preferred_book_types', 'preferred_formats', 'favorite_genres'], inplace=True)

    # Ensure all fields are lists
    for field in ['genre', 'cover_type', 'content_type']:
        user_df_db[field] = user_df_db[field].apply(lambda x: [] if x == [''] else x)

    # MultiLabelBinarizer for new user (use the same mlb_fields as the CSV)
    for field in ['genre', 'cover_type', 'content_type']:
        user_df_db[field] = user_df_db[field].apply(lambda x: [] if not isinstance(x, list) else x)
        mlb = mlb_fields[field]
        transformed = mlb.transform(user_df_db[field])
        mlb_df = pd.DataFrame(transformed, columns=[f'{field}_{cls}' for cls in mlb.classes_])
        user_df_db = pd.concat([user_df_db, mlb_df], axis=1)

    # One-hot encode language (ensure all columns exist)
    user_df_db = pd.get_dummies(user_df_db, columns=['language'])
    for col in [c for c in user_features_df.columns if c.startswith('language_')]:
        if col not in user_df_db.columns:
            user_df_db[col] = 0

    # Align columns with user_features_df
    user_features_db = user_df_db.reindex(columns=user_features_df.columns, fill_value=0)
    print(f"[LOG] user_features_db columns: {user_features_db.columns.tolist()}")

    # Drop 'id' from both, and reindex user to match book columns
    book_feature_columns = [col for col in books_vector.columns if col != 'id']

    user_vector = (
        user_features_db
        .drop(columns=['id'], errors='ignore')
        .reindex(columns=book_feature_columns, fill_value=0)
        .values.astype(float)
    )
    book_vectors = books_vector.drop(columns=['id'], errors='ignore').values.astype(float)
    print("user_vector shape:", user_vector.shape)
    print("book_vectors shape:", book_vectors.shape)
    print("book_feature_columns:", book_feature_columns)
    sim_scores = cosine_similarity(user_vector, book_vectors)[0]
    top_indices = sim_scores.argsort()[::-1][:top_n]
    top_book_ids = books_vector.index[top_indices]

    recommended_books = [
        {"book_id": book_id, "book_title": book_titles.get(book_id, "Unknown Title")}
        for book_id in top_book_ids
    ]
    print(f"[LOG] Recommendations: {recommended_books}")
    return recommended_books

def get_user_preferences_from_db(pref_id):
    pref = Preference.query.filter_by(id=pref_id).first()
    if not pref:
        return None
    # Convert SQLAlchemy object to dict, parsing arrays if needed
    def parse_array(val):
        if isinstance(val, list):
            return val
        if isinstance(val, str):
            return [x.strip().strip('"').strip("'") for x in val.strip('{}[]').split(',') if x.strip()]
        return []
    return {
        'id': str(pref.id),
        'age_group': pref.age_group,
        'education_level': pref.education_level,
        'city': pref.city,
        'preferred_language': pref.preferred_language,
        'reading_frequency': pref.reading_frequency,
        'reading_time_availability': pref.reading_time_availability,
        'reader_type': pref.reader_type,
        'reading_habits': pref.reading_habits,
        'favorite_genres': parse_array(pref.favorite_genres),
        'preferred_book_types': parse_array(pref.preferred_book_types),
        'preferred_formats': parse_array(pref.preferred_formats),
        'desired_feelings': parse_array(pref.desired_feelings),
        'disliked_genres': parse_array(pref.disliked_genres),
        # add other fields as needed
    }

user_df['id'] = user_df['id'].astype(str)

