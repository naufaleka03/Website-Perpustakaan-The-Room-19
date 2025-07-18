import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity

# --- Load Data Baru ---
book_df = pd.read_csv("data/books_db.csv")
user_df = pd.read_csv("data/user_old.csv")
peminjaman_df = pd.read_csv("data/loans_data.csv")

# --- Persiapan User-Item Matrix dan Similarity Matrix ---
agg_df = peminjaman_df.groupby(['user_id', 'book_id']).size().reset_index(name='rating')
user_item_matrix = agg_df.pivot_table(index='user_id', columns='book_id', values='rating', fill_value=0)
item_user_matrix = user_item_matrix.T
cosine_sim = cosine_similarity(item_user_matrix)
similarity_df_filtered = pd.DataFrame(
    cosine_sim,
    index=item_user_matrix.index,
    columns=item_user_matrix.index
)

# --- Fungsi Utama Rekomendasi ---
def rekomendasi_buku_precision_optimal(
    buku_id,
    similarity_df_filtered,
    book_df,
    peminjaman_df,
    top_n=5,
    hybrid=False,
    verbose=False,
    usage_filter="For Rent",
    score_threshold=0.3  # Default threshold ketat
):
    # Informasi buku utama
    genre_row = book_df[book_df['book_id'] == buku_id]
    judul_buku = genre_row.iloc[0]['book_title'] if not genre_row.empty else "Tidak ditemukan"
    kategori_buku = genre_row.iloc[0]['genre'] if not genre_row.empty else "Tidak diketahui"

    if verbose:
        print(f"\n📚 Rekomendasi untuk Buku ID: {buku_id}")
        print(f"📝 Judul   : {judul_buku}")
        print(f"🏷️ Kategori: {kategori_buku}\n")

    # Jika buku tidak ada di similarity matrix
    if buku_id not in similarity_df_filtered.index:
        if verbose:
            print(f"[!] Buku ID {buku_id} tidak ditemukan di similarity matrix. Menggunakan fallback.")
        return fallback_rekomendasi(book_df, peminjaman_df, similarity_df_filtered, kategori_buku, buku_id, top_n, usage_filter, hybrid)

    # Hitung skor similarity
    similarity_scores = similarity_df_filtered.loc[buku_id].drop(labels=buku_id, errors='ignore')
    similarity_scores = similarity_scores[similarity_scores >= score_threshold]
    sorted_scores = similarity_scores.sort_values(ascending=False)

    if hybrid:
        top_k = sorted_scores.head(15)
        sampled = top_k.sample(min(top_n, len(top_k)), random_state=None)
    else:
        sampled = sorted_scores.head(top_n)

    # Gabungkan dengan metadata buku
    rekomendasi = sampled.reset_index()
    rekomendasi.columns = ['book_id', 'score']
    hasil_df = rekomendasi.merge(book_df, on='book_id', how='left')

    # Filter berdasarkan penggunaan
    if usage_filter:
        hasil_df = hasil_df[hasil_df['usage'].str.contains(usage_filter, na=False)]

    hasil_df = hasil_df[hasil_df['book_id'] != buku_id].drop_duplicates(subset='book_id')

    # Tambahkan fallback jika hasil belum cukup
    jumlah_rekomendasi = len(hasil_df)
    if jumlah_rekomendasi < top_n:
        kekurangan = top_n - jumlah_rekomendasi
        max_fallback = top_n // 2  # Maksimal 50% fallback
        fallback_needed = min(kekurangan, max_fallback)

        fallback_df = fallback_rekomendasi(
            book_df, peminjaman_df, similarity_df_filtered,
            kategori_buku, buku_id, fallback_needed, usage_filter, hybrid,
            exclude_ids=set(hasil_df['book_id'].tolist() + [buku_id])
        )
        hasil_df = pd.concat([hasil_df, fallback_df], ignore_index=True)

    hasil_df = hasil_df.drop_duplicates(subset='book_id')
    return hasil_df[['book_id', 'book_title', 'genre', 'author', 'score']].sort_values(by='score', ascending=False).head(top_n)


# --- Fallback Helper ---
def fallback_rekomendasi(
    book_df,
    peminjaman_df,
    similarity_df_filtered,
    kategori_buku,
    buku_id,
    jumlah,
    usage_filter,
    hybrid,
    exclude_ids=None
):
    if exclude_ids is None:
        exclude_ids = set()
    exclude_ids.add(buku_id)

    fallback_pool = book_df[
        (book_df['genre'] == kategori_buku) &
        (book_df['book_id'].isin(similarity_df_filtered.index)) &
        (~book_df['book_id'].isin(exclude_ids))
    ]

    if usage_filter:
        fallback_pool = fallback_pool[fallback_pool['usage'].str.contains(usage_filter, na=False)]

    # Hitung popularitas berdasarkan jumlah peminjaman
    populer_df = peminjaman_df['book_id'].value_counts().reset_index()
    populer_df.columns = ['book_id', 'popularity']
    fallback_pool = fallback_pool.merge(populer_df, on='book_id', how='left')
    fallback_pool = fallback_pool.fillna({'popularity': 0}).sort_values(by='popularity', ascending=False)
    fallback_pool['score'] = 0.0  # Skor default fallback

    fallback_pool = fallback_pool.drop_duplicates(subset='book_id')
    if hybrid:
        return fallback_pool.sample(min(jumlah, len(fallback_pool)), random_state=None)[['book_id', 'book_title', 'genre', 'author', 'score']]
    else:
        return fallback_pool.head(jumlah)[['book_id', 'book_title', 'genre', 'author', 'score']]
