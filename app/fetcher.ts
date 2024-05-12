"use server"

import { AppendToResponse, MovieDetails, TMDB } from "tmdb-ts";

export async function getMovie(): Promise<AppendToResponse<MovieDetails, "watch/providers"[], "movie"> | null> {

    if (!process.env.TMDB_ACCESS) {
        console.error("Access Token is not set");
        return null;
    }

    const random_page = Math.floor(Math.random() * 500) + 1;

    const tmdb = new TMDB(process.env.TMDB_ACCESS);
    const movie = await tmdb.discover.movie({
        page: random_page
    });

   const selection = movie.results[Math.floor(Math.random() * movie.results.length)];

    return await tmdb.movies.details(selection.id, ["watch/providers"]);
}