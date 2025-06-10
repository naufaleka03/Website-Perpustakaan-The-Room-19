from flask import Flask, request, jsonify
from flask_cors import CORS
from recommendation import rekomendasi_buku_precision_optimal, book_df, peminjaman_df, similarity_df_filtered

app = Flask(__name__)
CORS(app)

@app.route('/recommendation', methods=['GET'])
def rekomendasi_api():
    buku_id = request.args.get('book_id')
    if not buku_id:
        return jsonify({'error': 'Parameter book_id wajib disertakan'}), 400

    try:
        rekomendasi = rekomendasi_buku_precision_optimal(
            buku_id=buku_id,
            similarity_df_filtered=similarity_df_filtered,
            book_df=book_df,
            peminjaman_df=peminjaman_df,
            top_n=5,
            hybrid=True,
            verbose=False
        )
        # Ambil info buku asal
        buku_asal = book_df[book_df['book_id'] == buku_id]
        if buku_asal.empty:
            return jsonify({'error': 'Buku asal tidak ditemukan'}), 404

        book_title = buku_asal.iloc[0]['book_title']
        genre = buku_asal.iloc[0]['genre']
        hasil = rekomendasi.to_dict(orient='records')
        return jsonify({'buku_id': buku_id, 'book_title': book_title, 'genre': genre, 'rekomendasi': hasil})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
