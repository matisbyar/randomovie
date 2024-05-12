"use client";
import { useEffect, useState } from "react";
import { getMovie } from "@/app/fetcher";
import { AppendToResponse, type MovieDetails } from 'tmdb-ts';
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { AuroraBackground } from "@/components/acernity/aurora";
import { CaretLeftIcon, CaretRightIcon, ReloadIcon } from "@radix-ui/react-icons";
import { Badge } from "@/components/ui/badge";
import getCountryFlag from 'country-flag-icons/unicode'
import { TransitionalImage } from "@/components/custom/TransitionalImage";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type Movie = AppendToResponse<MovieDetails, "watch/providers"[], "movie"> | null;
type MovieNonNull = AppendToResponse<MovieDetails, "watch/providers"[], "movie">;

export default function Home() {
    const [movie, setMovie] = useState<Movie>(null);
    const [loading, setLoading] = useState(true);
    const [history, setHistory] = useState<Movie[]>([]);
    const [index, setIndex] = useState(history.length - 1);

    useEffect(() => {
        void handleGetAnotherMovie();
    }, []);

    const handleGetAnotherMovie = async () => {
        setLoading(true);
        try {
            const movieData = await getMovie();
            setMovie(movieData);
            setHistory(prevHistory => [...prevHistory, movieData]);
            setLoading(false);
            setIndex(history.length);
        } catch (error) {
            console.error("Error fetching another movie:", error);
            setLoading(false);
        }
        console.log("history", history)

    };

    const handlePreviousMovie = () => {
        if (index > 0) {
            const newIndex = index - 1;
            setIndex(newIndex);
            setMovie(history[newIndex]);
        }
    }

    const handleNextMovie = () => {
        if (index < history.length - 1) {
            const newIndex = index + 1;
            setIndex(newIndex);
            setMovie(history[newIndex]);
        }
    }

    return (
        <div>
            <Backdrop movie={ movie }/>
            <AuroraBackground className="w-screen h-screen justify-start">
                <header className="flex justify-around w-full z-10 my-6">
                    <h1 className="text-2xl font-bold">RandoMovie</h1>
                    <div className="flex gap-4">
                        <div>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipContent>Previous movie</TooltipContent>
                                    <TooltipTrigger asChild>
                                        <Button variant="ghost"
                                                disabled={ index === 0 }
                                                onClick={ handlePreviousMovie }
                                                className="rounded-r-none"><CaretLeftIcon/></Button>
                                    </TooltipTrigger>
                                </Tooltip>
                            </TooltipProvider>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipContent>Next movie</TooltipContent>
                                    <TooltipTrigger asChild>
                                        <Button variant="ghost"
                                                disabled={ index >= history.length - 1 }
                                                onClick={ handleNextMovie }
                                                className="rounded-l-none"><CaretRightIcon/></Button>
                                    </TooltipTrigger>
                                </Tooltip>
                            </TooltipProvider>
                        </div>

                        <Button onClick={ handleGetAnotherMovie } disabled={ loading }><ReloadIcon/></Button>
                    </div>
                </header>
                <main className="flex flex-col justify-center w-[90%] md:max-w-2xl z-10">
                    <MovieDetails movie={ movie } setMovie={ setMovie } loading={ loading } setLoading={ setLoading }/>
                </main>
            </AuroraBackground>
        </div>
    );
}

function MovieDetails({movie, loading}: { movie: Movie, setMovie: (movie: Movie) => void, loading: boolean, setLoading: (loading: boolean) => void }) {
    return loading ? (
        <div className="text-center flex flex-col gap-4">
            <Skeleton className="w-[300px] h-[450px] m-auto"/>
            <Skeleton className="w-80 h-8 mt-4"/>
            <div className="flex flex-col gap-2">
                <Skeleton className="w-[42rem] h-32"/>
            </div>
        </div>
    ) : movie ? (
        <div className="text-center flex flex-col gap-4 mb-12">
            <Image
                src={ `https://image.tmdb.org/t/p/w500${ movie.poster_path }` }
                width={ 300 }
                height={ 450 }
                alt={ movie.original_title }
                className="m-auto rounded-lg"
            />
            <h2 className="flex flex-col justify-center items-center text-2xl font-bold mt-4 gap-2">
                <span className="text-3xl text-gray-800 dark:text-gray-200">{ movie.title }</span>
                { movie.title !== movie.original_title && (
                    <div>
                        <span className="text-lg text-gray-800 dark:text-gray-200">{ `${ getCountryFlag(movie.original_language.toUpperCase()) } ${ movie.original_title }` }</span>
                    </div>
                ) }
                <div className="flex flex-wrap gap-2">
                    <Badge>{new Date(movie.release_date).toLocaleString(undefined,{ month: 'long', day: 'numeric', year: 'numeric' })}</Badge>
                    <Badge>{ movie.runtime } min</Badge>
                </div>
            </h2>

            <p className="text-justify">{ movie.overview || "" }</p>


            <div className="flex flex-wrap gap-4 min-h-[32px] *:items-center">
                <div className="flex flex-wrap gap-2">
                    <p className="text-sm">Genres</p>
                    { movie.genres.map((genre, index) => (
                        <Badge key={ index } variant="secondary">{ genre.name }</Badge>
                    )) }
                </div>

                { movie["watch/providers"] && movie["watch/providers"].results?.FR?.flatrate && (
                    <WatchProviders movie={ movie }/>
                ) }
            </div>

        </div>
    ) : (
        <>
            <h2>Movie not found</h2>
        </>
    );
}

function Backdrop({movie}: { movie: Movie }) {
    return (
        <>
            { movie?.backdrop_path && (
                <TransitionalImage src={ `https://image.tmdb.org/t/p/w500${ movie.backdrop_path }` }
                                   className="absolute top-0 left-0 w-full z-9 blur-[25px] md:h-screen h-full"
                                   alt={ movie.title || "Current movie backdrop" }
                                   width={ 1920 }
                                   height={ 1080 }
                />
            ) }
        </>
    );
}

function WatchProviders({movie}: { movie: MovieNonNull }) {
    return (
        <div className="flex flex-wrap gap-2">
            <p className="text-sm">Available on</p>
            { movie["watch/providers"]?.results.FR?.flatrate?.map((provider, index) => {
                return (<Badge key={ index } className="gap-2">
                    <Image src={ `https://image.tmdb.org/t/p/w500${ provider.logo_path }` }
                           alt={ `${ provider.provider_name }'s logo` }
                           width={ 24 }
                           height={ 24 }
                           className="rounded-full"
                    />
                    { provider.provider_name }
                </Badge>)
            }) }
        </div>
    );
}