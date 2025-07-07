import pandas as pd
from recommendation import load_user_data, load_books_data
from sklearn.preprocessing import MultiLabelBinarizer
from sklearn.metrics.pairwise import cosine_similarity
import random
import ast
import matplotlib.pyplot as plt

def evaluate_precision_recall_at_k(k=5):
    """
    Evaluate Precision@K and Recall@K for all users in user_preferences.csv, using only CSV data (no DB lookup).
    A recommended book is considered relevant if its genre matches any of the user's preferred genres.
    """
    user_df_eval = load_user_data()
    books_df_eval = load_books_data()
    user_df_eval['favorite_genres'] = user_df_eval['favorite_genres'].str.strip('{}').str.split(',')
    books_df_eval['genre'] = books_df_eval['genre'].str.strip('{}').str.split(',')

    # Save a copy of the original genres for each book for evaluation
    books_df_eval['original_genre'] = books_df_eval['genre']

    # Feature engineering (copied from recommendation.py, but ensure all categorical cols are strings)
    language_map = {
        'indonesian': 'Indonesia',
        'english': 'Inggris',
        'other' : 'Other'
    }
    book_type_map = {
        'fiction': 'Fiction',
        'non-fiction': 'Nonfiction'
    }
    cover_type_map = {
        'paperback': 'Paperback',
        'hardcover': 'Hardcover',
        'ebook': 'Ebook',
        'audiobook': 'Audiobook'
    }
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
    user_df_eval['language'] = user_df_eval['preferred_language'].map(language_map).fillna(user_df_eval['preferred_language'])
    user_df_eval['content_type'] = user_df_eval['preferred_book_types'].apply(
        lambda x: [book_type_map.get(i.strip(), i.strip().title()) for i in x] if isinstance(x, list) and x != [''] else []
    )
    user_df_eval['cover_type'] = user_df_eval['preferred_formats'].apply(
        lambda x: [cover_type_map.get(i.strip(), i.strip().title()) for i in x] if isinstance(x, list) and x != [''] else []
    )
    user_df_eval['genre'] = user_df_eval['favorite_genres'].apply(
        lambda x: [genre_map.get(i.strip(), i.strip().replace('_', ' ').title()) for i in x] if isinstance(x, list) and x != [''] else []
    )
    user_df_eval.drop(columns=['preferred_language', 'preferred_book_types', 'preferred_formats', 'favorite_genres'], inplace=True)
    fields = ['genre', 'cover_type', 'content_type']
    for field in fields:
        user_df_eval[field] = user_df_eval[field].apply(lambda x: [] if x == [''] else x)
    mlb_fields = {}
    for field in fields:
        user_df_eval[field] = user_df_eval[field].apply(lambda x: [] if not isinstance(x, list) else x)
        mlb = MultiLabelBinarizer()
        transformed = mlb.fit_transform(user_df_eval[field])
        mlb_df = pd.DataFrame(transformed, columns=[f'{field}_{cls}' for cls in mlb.classes_])
        mlb_df.index = user_df_eval.index
        user_df_eval = pd.concat([user_df_eval, mlb_df], axis=1)
        mlb_fields[field] = mlb
    user_df_eval = pd.get_dummies(user_df_eval, columns=['language'])
    user_features_df = user_df_eval.drop(columns=[
        'genre', 'age_group', 'education_level', 'cover_type', 'content_type', 'city',
        'reading_frequency', 'reading_time_availability', 'reader_type', 'reading_habits',
        'desired_feelings', 'disliked_genres'
    ])
    # Book features
    def safe_parse_themes(x):
        if isinstance(x, str):
            import ast
            try:
                return ast.literal_eval(x)
            except Exception:
                return []
        return []
    if 'themes' in books_df_eval.columns:
        books_df_eval['themes'] = books_df_eval['themes'].apply(safe_parse_themes)
    # Ensure all categorical columns are strings for get_dummies
    categorical_cols = ['language', 'cover_type', 'content_type', 'genre']
    for col in categorical_cols:
        books_df_eval[col] = books_df_eval[col].apply(lambda x: ','.join([str(i).strip() for i in x]) if isinstance(x, list) else str(x))
    one_hot_encoded = pd.get_dummies(books_df_eval[categorical_cols], prefix=categorical_cols)
    book_features_df = pd.concat([books_df_eval[['id', 'book_title', 'original_genre']], one_hot_encoded], axis=1)
    books_df_eval = book_features_df.copy().reset_index(drop=True)
    users_df = user_features_df.copy().reset_index(drop=True)
    book_ids = books_df_eval['id'].values
    user_ids = users_df['id'].values
    books_features = books_df_eval.drop(columns=['id', 'book_title', 'original_genre'], errors='ignore')
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
    # Now, for each user, compute similarity and recommendations
    precisions = []
    recalls = []
    for user_id in user_ids:
        # Get the user vector
        user_vec = users_vector.loc[user_id].values.reshape(1, -1)
        book_vecs = books_vector.values
        sim_scores = cosine_similarity(user_vec, book_vecs)[0]
        top_indices = sim_scores.argsort()[::-1][:k]
        top_book_ids = books_vector.index[top_indices]
        # Get preferred genres for this user
        orig_user_row = user_df_eval[user_df_eval['id'] == user_id]
        if orig_user_row.empty:
            continue
        preferred_genres = set()
        if 'genre' in orig_user_row.columns:
            for g_list in orig_user_row.iloc[0]['genre']:
                if g_list:
                    preferred_genres.add(g_list.strip())
        if not preferred_genres:
            continue
        # Get genres of recommended books
        rec_genres = []
        for book_id in top_book_ids:
            book_row = books_df_eval[books_df_eval['id'] == book_id]
            if not book_row.empty:
                genres = book_row.iloc[0]['original_genre'] if isinstance(book_row.iloc[0]['original_genre'], list) else []
                rec_genres.append(set([g.strip() for g in genres if g.strip()]))
            else:
                rec_genres.append(set())
        # Precision@K: how many recommended books have at least one matching genre
        relevant = [1 if preferred_genres & genres else 0 for genres in rec_genres]
        precision = sum(relevant) / k if k > 0 else 0
        # Recall@K: how many relevant books in the dataset are recommended
        relevant_books = books_df_eval[books_df_eval['original_genre'].apply(lambda genres: bool(preferred_genres & set([g.strip() for g in genres if g.strip()])) if isinstance(genres, list) else False)]['id'].tolist()
        recall = sum(relevant) / len(relevant_books) if relevant_books else 0
        precisions.append(precision)
        recalls.append(recall)
    avg_precision = sum(precisions) / len(precisions) if precisions else 0
    avg_recall = sum(recalls) / len(recalls) if recalls else 0
    print(f"[CSV ONLY] Average Precision@{k}: {avg_precision:.4f}")
    print(f"[CSV ONLY] Average Recall@{k}: {avg_recall:.4f}")
    return precisions, recalls

def evaluate_precision_recall_at_k_genre_or_language(k=5):
    """
    Evaluate Precision@K and Recall@K for all users in user_preferences.csv, using only CSV data (no DB lookup).
    A recommended book is considered relevant if its genre matches any of the user's preferred genres OR its language matches the user's preferred language.
    """
    print("[INFO] Relevance = genre match OR language match")
    user_df_eval = load_user_data()
    books_df_eval = load_books_data()
    user_df_eval['favorite_genres'] = user_df_eval['favorite_genres'].str.strip('{}').str.split(',')
    books_df_eval['genre'] = books_df_eval['genre'].str.strip('{}').str.split(',')
    # Save a copy of the original genres and language for each book for evaluation
    books_df_eval['original_genre'] = books_df_eval['genre']
    language_map = {'indonesian': 'Indonesia', 'english': 'Inggris', 'other': 'Other'}
    books_df_eval['original_language'] = books_df_eval['language'].map(language_map).fillna(books_df_eval['language'])
    user_df_eval['language'] = user_df_eval['preferred_language'].map(language_map).fillna(user_df_eval['preferred_language'])

    book_type_map = {'fiction': 'Fiction', 'non-fiction': 'Nonfiction'}
    cover_type_map = {'paperback': 'Paperback', 'hardcover': 'Hardcover', 'ebook': 'Ebook', 'audiobook': 'Audiobook'}
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
    user_df_eval['content_type'] = user_df_eval['preferred_book_types'].apply(
        lambda x: [book_type_map.get(i.strip(), i.strip().title()) for i in x] if isinstance(x, list) and x != [''] else []
    )
    user_df_eval['cover_type'] = user_df_eval['preferred_formats'].apply(
        lambda x: [cover_type_map.get(i.strip(), i.strip().title()) for i in x] if isinstance(x, list) and x != [''] else []
    )
    user_df_eval['genre'] = user_df_eval['favorite_genres'].apply(
        lambda x: [genre_map.get(i.strip(), i.strip().replace('_', ' ').title()) for i in x] if isinstance(x, list) and x != [''] else []
    )
    user_df_eval.drop(columns=['preferred_language', 'preferred_book_types', 'preferred_formats', 'favorite_genres'], inplace=True)
    fields = ['genre', 'cover_type', 'content_type']
    for field in fields:
        user_df_eval[field] = user_df_eval[field].apply(lambda x: [] if x == [''] else x)
    mlb_fields = {}
    for field in fields:
        user_df_eval[field] = user_df_eval[field].apply(lambda x: [] if not isinstance(x, list) else x)
        mlb = MultiLabelBinarizer()
        transformed = mlb.fit_transform(user_df_eval[field])
        mlb_df = pd.DataFrame(transformed, columns=[f'{field}_{cls}' for cls in mlb.classes_])
        mlb_df.index = user_df_eval.index
        user_df_eval = pd.concat([user_df_eval, mlb_df], axis=1)
        mlb_fields[field] = mlb
    user_df_eval = pd.get_dummies(user_df_eval, columns=['language'])
    user_features_df = user_df_eval.drop(columns=[
        'genre', 'age_group', 'education_level', 'cover_type', 'content_type', 'city',
        'reading_frequency', 'reading_time_availability', 'reader_type', 'reading_habits',
        'desired_feelings', 'disliked_genres'
    ])
    def safe_parse_themes(x):
        if isinstance(x, str):
            import ast
            try:
                return ast.literal_eval(x)
            except Exception:
                return []
        return []
    if 'themes' in books_df_eval.columns:
        books_df_eval['themes'] = books_df_eval['themes'].apply(safe_parse_themes)
    categorical_cols = ['language', 'cover_type', 'content_type', 'genre']
    for col in categorical_cols:
        books_df_eval[col] = books_df_eval[col].apply(lambda x: ','.join([str(i).strip() for i in x]) if isinstance(x, list) else str(x))
    one_hot_encoded = pd.get_dummies(books_df_eval[categorical_cols], prefix=categorical_cols)
    book_features_df = pd.concat([books_df_eval[['id', 'book_title', 'original_genre', 'original_language']], one_hot_encoded], axis=1)
    books_df_eval = book_features_df.copy().reset_index(drop=True)
    users_df = user_features_df.copy().reset_index(drop=True)
    book_ids = books_df_eval['id'].values
    user_ids = users_df['id'].values
    books_features = books_df_eval.drop(columns=['id', 'book_title', 'original_genre', 'original_language'], errors='ignore')
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
    precisions = []
    recalls = []
    for user_id in user_ids:
        user_vec = users_vector.loc[user_id].values.reshape(1, -1)
        book_vecs = books_vector.values
        sim_scores = cosine_similarity(user_vec, book_vecs)[0]
        top_indices = sim_scores.argsort()[::-1][:k]
        top_book_ids = books_vector.index[top_indices]
        orig_user_row = user_df_eval[user_df_eval['id'] == user_id]
        if orig_user_row.empty:
            continue
        preferred_genres = set()
        if 'genre' in orig_user_row.columns:
            for g_list in orig_user_row.iloc[0]['genre']:
                if g_list:
                    preferred_genres.add(g_list.strip())
        preferred_language = orig_user_row.iloc[0]['language'] if 'language' in orig_user_row.columns else None
        if not preferred_genres and not preferred_language:
            continue
        rec_genres = []
        rec_languages = []
        for book_id in top_book_ids:
            book_row = books_df_eval[books_df_eval['id'] == book_id]
            if not book_row.empty:
                genres = book_row.iloc[0]['original_genre'] if isinstance(book_row.iloc[0]['original_genre'], list) else []
                language = book_row.iloc[0]['original_language']
                rec_genres.append(set([g.strip() for g in genres if g.strip()]))
                rec_languages.append(language)
            else:
                rec_genres.append(set())
                rec_languages.append(None)
        # Precision@K: relevant if genre OR language matches
        relevant = [1 if (preferred_genres & genres or preferred_language == language) else 0 for genres, language in zip(rec_genres, rec_languages)]
        precision = sum(relevant) / k if k > 0 else 0
        # Recall@K: how many relevant books in the dataset are recommended
        relevant_books = books_df_eval[
            books_df_eval['original_genre'].apply(lambda genres: bool(preferred_genres & set([g.strip() for g in genres if g.strip()])) if isinstance(genres, list) else False)
            | (books_df_eval['original_language'] == preferred_language)
        ]['id'].tolist()
        recall = sum(relevant) / len(relevant_books) if relevant_books else 0
        precisions.append(precision)
        recalls.append(recall)
    avg_precision = sum(precisions) / len(precisions) if precisions else 0
    avg_recall = sum(recalls) / len(recalls) if recalls else 0
    print(f"[CSV ONLY] Average Precision@{k}: {avg_precision:.4f}")
    print(f"[CSV ONLY] Average Recall@{k}: {avg_recall:.4f}")
    return precisions, recalls

def print_sample_recommendations(k=5, num_users=5):
    """
    For a sample of users, print their top K recommendations with genres and languages, and compare to their preferences.
    Indicate if each recommendation matches genre, language, or both.
    """
    print(f"\n[SAMPLE RECOMMENDATIONS] Showing top {k} recommendations for {num_users} random users:")
    user_df_eval = load_user_data()
    books_df_eval = load_books_data()
    user_df_eval['favorite_genres'] = user_df_eval['favorite_genres'].str.strip('{}').str.split(',')
    books_df_eval['genre'] = books_df_eval['genre'].str.strip('{}').str.split(',')
    books_df_eval['original_genre'] = books_df_eval['genre']
    language_map = {'indonesian': 'Indonesia', 'english': 'Inggris', 'other': 'Other'}
    books_df_eval['original_language'] = books_df_eval['language'].map(language_map).fillna(books_df_eval['language'])
    user_df_eval['language'] = user_df_eval['preferred_language'].map(language_map).fillna(user_df_eval['preferred_language'])
    # Save the mapped language before one-hot encoding
    user_df_eval['original_language'] = user_df_eval['language']
    book_type_map = {'fiction': 'Fiction', 'non-fiction': 'Nonfiction'}
    cover_type_map = {'paperback': 'Paperback', 'hardcover': 'Hardcover', 'ebook': 'Ebook', 'audiobook': 'Audiobook'}
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
    user_df_eval['content_type'] = user_df_eval['preferred_book_types'].apply(
        lambda x: [book_type_map.get(i.strip(), i.strip().title()) for i in x] if isinstance(x, list) and x != [''] else []
    )
    user_df_eval['cover_type'] = user_df_eval['preferred_formats'].apply(
        lambda x: [cover_type_map.get(i.strip(), i.strip().title()) for i in x] if isinstance(x, list) and x != [''] else []
    )
    user_df_eval['genre'] = user_df_eval['favorite_genres'].apply(
        lambda x: [genre_map.get(i.strip(), i.strip().replace('_', ' ').title()) for i in x] if isinstance(x, list) and x != [''] else []
    )
    user_df_eval.drop(columns=['preferred_language', 'preferred_book_types', 'preferred_formats', 'favorite_genres'], inplace=True)
    fields = ['genre', 'cover_type', 'content_type']
    for field in fields:
        user_df_eval[field] = user_df_eval[field].apply(lambda x: [] if x == [''] else x)
    mlb_fields = {}
    for field in fields:
        user_df_eval[field] = user_df_eval[field].apply(lambda x: [] if not isinstance(x, list) else x)
        mlb = MultiLabelBinarizer()
        transformed = mlb.fit_transform(user_df_eval[field])
        mlb_df = pd.DataFrame(transformed, columns=[f'{field}_{cls}' for cls in mlb.classes_])
        mlb_df.index = user_df_eval.index
        user_df_eval = pd.concat([user_df_eval, mlb_df], axis=1)
        mlb_fields[field] = mlb
    user_df_eval = pd.get_dummies(user_df_eval, columns=['language'])
    user_features_df = user_df_eval.drop(columns=[
        'genre', 'age_group', 'education_level', 'cover_type', 'content_type', 'city',
        'reading_frequency', 'reading_time_availability', 'reader_type', 'reading_habits',
        'desired_feelings', 'disliked_genres', 'original_language'  # drop non-numeric
    ], errors='ignore')
    def safe_parse_themes(x):
        if isinstance(x, str):
            import ast
            try:
                return ast.literal_eval(x)
            except Exception:
                return []
        return []
    if 'themes' in books_df_eval.columns:
        books_df_eval['themes'] = books_df_eval['themes'].apply(safe_parse_themes)
    categorical_cols = ['language', 'cover_type', 'content_type', 'genre']
    for col in categorical_cols:
        books_df_eval[col] = books_df_eval[col].apply(lambda x: ','.join([str(i).strip() for i in x]) if isinstance(x, list) else str(x))
    one_hot_encoded = pd.get_dummies(books_df_eval[categorical_cols], prefix=categorical_cols)
    book_features_df = pd.concat([books_df_eval[['id', 'book_title', 'original_genre', 'original_language']], one_hot_encoded], axis=1)
    books_df_eval = book_features_df.copy().reset_index(drop=True)
    users_df = user_features_df.copy().reset_index(drop=True)
    book_ids = books_df_eval['id'].values
    user_ids = users_df['id'].values
    books_features = books_df_eval.drop(columns=['id', 'book_title', 'original_genre', 'original_language'], errors='ignore')
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
    # Pick random users
    sampled_user_ids = random.sample(list(user_ids), min(num_users, len(user_ids)))
    for user_id in sampled_user_ids:
        orig_user_row = user_df_eval[user_df_eval['id'] == user_id]
        if orig_user_row.empty:
            continue
        preferred_genres = set()
        if 'genre' in orig_user_row.columns:
            for g_list in orig_user_row.iloc[0]['genre']:
                if g_list:
                    preferred_genres.add(g_list.strip())
        preferred_language = orig_user_row.iloc[0]['original_language'] if 'original_language' in orig_user_row.columns else None
        print(f"\nUser {user_id} preferences:")
        print(f"  Genres: {preferred_genres}")
        print(f"  Language: {preferred_language}")
        user_vec = users_vector.loc[user_id].values.reshape(1, -1)
        book_vecs = books_vector.values
        sim_scores = cosine_similarity(user_vec, book_vecs)[0]
        top_indices = sim_scores.argsort()[::-1][:k]
        top_book_ids = books_vector.index[top_indices]
        print(f"  Top {k} recommendations:")
        for i, book_id in enumerate(top_book_ids):
            book_row = books_df_eval[books_df_eval['id'] == book_id]
            if not book_row.empty:
                book = book_row.iloc[0]
                genres = book['original_genre'] if isinstance(book['original_genre'], list) else []
                language = book['original_language']
                title = book['book_title']
                genre_match = bool(preferred_genres & set([g.strip() for g in genres if g.strip()]))
                language_match = (preferred_language == language)
                match_type = ""
                if genre_match and language_match:
                    match_type = "[BOTH]"
                elif genre_match:
                    match_type = "[GENRE]"
                elif language_match:
                    match_type = "[LANGUAGE]"
                else:
                    match_type = "[NO MATCH]"
                print(f"    {i+1}. {title} | Genres: {genres} | Language: {language} {match_type}")
            else:
                print(f"    {i+1}. [Book not found]")

def evaluate_precision_vs_threshold(k=5, thresholds=[0.1, 0.2, 0.3, 0.4, 0.5]):
    """
    Evaluate Precision@K and Recall@K for several threshold similarity values and plot the results.
    """
    user_df_eval = load_user_data()
    books_df_eval = load_books_data()
    user_df_eval['favorite_genres'] = user_df_eval['favorite_genres'].str.strip('{}').str.split(',')
    books_df_eval['genre'] = books_df_eval['genre'].str.strip('{}').str.split(',')
    books_df_eval['original_genre'] = books_df_eval['genre']

    # Feature engineering (copy from evaluate_precision_recall_at_k)
    language_map = {
        'indonesian': 'Indonesia',
        'english': 'Inggris',
        'other' : 'Other'
    }
    book_type_map = {
        'fiction': 'Fiction',
        'non-fiction': 'Nonfiction'
    }
    cover_type_map = {
        'paperback': 'Paperback',
        'hardcover': 'Hardcover',
        'ebook': 'Ebook',
        'audiobook': 'Audiobook'
    }
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
    user_df_eval['language'] = user_df_eval['preferred_language'].map(language_map).fillna(user_df_eval['preferred_language'])
    user_df_eval['content_type'] = user_df_eval['preferred_book_types'].apply(
        lambda x: [book_type_map.get(i.strip(), i.strip().title()) for i in x] if isinstance(x, list) and x != [''] else []
    )
    user_df_eval['cover_type'] = user_df_eval['preferred_formats'].apply(
        lambda x: [cover_type_map.get(i.strip(), i.strip().title()) for i in x] if isinstance(x, list) and x != [''] else []
    )
    user_df_eval['genre'] = user_df_eval['favorite_genres'].apply(
        lambda x: [genre_map.get(i.strip(), i.strip().replace('_', ' ').title()) for i in x] if isinstance(x, list) and x != [''] else []
    )
    user_df_eval.drop(columns=['preferred_language', 'preferred_book_types', 'preferred_formats', 'favorite_genres'], inplace=True)
    fields = ['genre', 'cover_type', 'content_type']
    for field in fields:
        user_df_eval[field] = user_df_eval[field].apply(lambda x: [] if x == [''] else x)
    mlb_fields = {}
    for field in fields:
        user_df_eval[field] = user_df_eval[field].apply(lambda x: [] if not isinstance(x, list) else x)
        mlb = MultiLabelBinarizer()
        transformed = mlb.fit_transform(user_df_eval[field])
        mlb_df = pd.DataFrame(transformed, columns=[f'{field}_{cls}' for cls in mlb.classes_])
        mlb_df.index = user_df_eval.index
        user_df_eval = pd.concat([user_df_eval, mlb_df], axis=1)
        mlb_fields[field] = mlb
    user_df_eval = pd.get_dummies(user_df_eval, columns=['language'])
    user_features_df = user_df_eval.drop(columns=[
        'genre', 'age_group', 'education_level', 'cover_type', 'content_type', 'city',
        'reading_frequency', 'reading_time_availability', 'reader_type', 'reading_habits',
        'desired_feelings', 'disliked_genres'
    ])
    # Book features
    def safe_parse_themes(x):
        if isinstance(x, str):
            import ast
            try:
                return ast.literal_eval(x)
            except Exception:
                return []
        return []
    if 'themes' in books_df_eval.columns:
        books_df_eval['themes'] = books_df_eval['themes'].apply(safe_parse_themes)
    categorical_cols = ['language', 'cover_type', 'content_type', 'genre']
    for col in categorical_cols:
        books_df_eval[col] = books_df_eval[col].apply(lambda x: ','.join([str(i).strip() for i in x]) if isinstance(x, list) else str(x))
    one_hot_encoded = pd.get_dummies(books_df_eval[categorical_cols], prefix=categorical_cols)
    book_features_df = pd.concat([books_df_eval[['id', 'book_title', 'original_genre']], one_hot_encoded], axis=1)
    books_df_eval = book_features_df.copy().reset_index(drop=True)
    users_df = user_features_df.copy().reset_index(drop=True)
    book_ids = books_df_eval['id'].values
    user_ids = users_df['id'].values
    books_features = books_df_eval.drop(columns=['id', 'book_title', 'original_genre'], errors='ignore')
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

    results_precision = []
    results_recall = []
    for threshold in thresholds:
        precisions = []
        recalls = []
        for user_id in user_ids:
            user_vec = users_vector.loc[user_id].values.reshape(1, -1)
            sim_scores = cosine_similarity(user_vec, books_vector.values)[0]
            # Ambil buku dengan similarity > threshold
            filtered_indices = [i for i, score in enumerate(sim_scores) if score > threshold]
            if not filtered_indices:
                continue
            filtered_scores = [(i, sim_scores[i]) for i in filtered_indices]
            filtered_scores.sort(key=lambda x: x[1], reverse=True)
            top_indices = [i for i, _ in filtered_scores[:k]]
            top_book_ids = books_vector.index[top_indices]
            orig_user_row = user_df_eval[user_df_eval['id'] == user_id]
            if orig_user_row.empty:
                continue
            preferred_genres = set()
            if 'genre' in orig_user_row.columns:
                for g_list in orig_user_row.iloc[0]['genre']:
                    if g_list:
                        preferred_genres.add(g_list.strip())
            if not preferred_genres:
                continue
            rec_genres = []
            for book_id in top_book_ids:
                book_row = books_df_eval[books_df_eval['id'] == book_id]
                if not book_row.empty:
                    genres = book_row.iloc[0]['original_genre'] if isinstance(book_row.iloc[0]['original_genre'], list) else []
                    rec_genres.append(set([g.strip() for g in genres if g.strip()]))
                else:
                    rec_genres.append(set())
            relevant = [1 if preferred_genres & genres else 0 for genres in rec_genres]
            precision = sum(relevant) / k if k > 0 else 0
            # Recall@K: berapa banyak buku relevan yang berhasil direkomendasikan
            relevant_books = books_df_eval[books_df_eval['original_genre'].apply(
                lambda genres: bool(preferred_genres & set([g.strip() for g in genres if g.strip()])) if isinstance(genres, list) else False
            )]['id'].tolist()
            recall = sum(relevant) / len(relevant_books) if relevant_books else 0
            precisions.append(precision)
            recalls.append(recall)
        avg_precision = sum(precisions) / len(precisions) if precisions else 0
        avg_recall = sum(recalls) / len(recalls) if recalls else 0
        results_precision.append(avg_precision)
        results_recall.append(avg_recall)
        print(f"Threshold {threshold:.2f}: Precision@{k} = {avg_precision:.4f}, Recall@{k} = {avg_recall:.4f}")
    # Plot grafik Precision
    plt.figure()
    plt.plot(thresholds, results_precision, marker='o', color='b', label=f'Precision@{k}')
    for x, y in zip(thresholds, results_precision):
        plt.text(x, y, f'{y:.4f}', ha='center', va='bottom')
    plt.xlabel('Threshold Similarity')
    plt.ylabel(f'Precision@{k}')
    plt.title(f'Precision@{k} terhadap Threshold Similarity')
    plt.legend()
    plt.grid(True)
    plt.savefig('precision_vs_threshold.png')
    plt.show()
    # Plot grafik Recall
    plt.figure()
    plt.plot(thresholds, results_recall, marker='o', color='g', label=f'Recall@{k}')
    for x, y in zip(thresholds, results_recall):
        plt.text(x, y, f'{y:.4f}', ha='center', va='bottom')
    plt.xlabel('Threshold Similarity')
    plt.ylabel(f'Recall@{k}')
    plt.title(f'Recall@{k} terhadap Threshold Similarity')
    plt.legend()
    plt.grid(True)
    plt.savefig('recall_vs_threshold.png')
    plt.show()

def evaluate_precision_vs_k(k_values=[3, 5, 10]):
    precisions = []
    recalls = []
    for k in k_values:
        p, r = evaluate_precision_recall_at_k(k=k)
        avg_p = sum(p) / len(p) if p else 0
        avg_r = sum(r) / len(r) if r else 0
        precisions.append(avg_p)
        recalls.append(avg_r)
        print(f"k={k}: Precision={avg_p:.4f}, Recall={avg_r:.4f}")
    # Plot grafik Precision
    plt.figure()
    plt.plot(k_values, precisions, marker='o', color='brown', label='Precision@k')
    for x, y in zip(k_values, precisions):
        plt.text(x, y, f'{y:.4f}', ha='center', va='bottom')
    plt.xlabel('Jumlah Rekomendasi (k)')
    plt.ylabel('Precision')
    plt.title('Precision terhadap Jumlah Rekomendasi (k)')
    plt.legend()
    plt.grid(True)
    plt.savefig('precision_vs_k.png')
    plt.show()
    # Plot grafik Recall
    plt.figure()
    plt.plot(k_values, recalls, marker='o', color='orange', label='Recall@k')
    for x, y in zip(k_values, recalls):
        plt.text(x, y, f'{y:.4f}', ha='center', va='bottom')
    plt.xlabel('Jumlah Rekomendasi (k)')
    plt.ylabel('Recall')
    plt.title('Recall terhadap Jumlah Rekomendasi (k)')
    plt.legend()
    plt.grid(True)
    plt.savefig('recall_vs_k.png')
    plt.show()

if __name__ == "__main__":
    print("\n[GENRE ONLY EVALUATION]")
    evaluate_precision_recall_at_k(k=5)
    print("\n[GENRE OR LANGUAGE EVALUATION]")
    evaluate_precision_recall_at_k_genre_or_language(k=5)
    print_sample_recommendations(k=5, num_users=5)
    print("\n[THRESHOLD EVALUATION]")
    evaluate_precision_vs_threshold(k=5, thresholds=[0.1, 0.2, 0.3, 0.4, 0.5])
    print("\n[PRECISION VS K EVALUATION]")
    evaluate_precision_vs_k(k_values=[3, 5, 10])
