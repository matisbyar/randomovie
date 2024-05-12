import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type ImageProps = {
    src: string;
    alt: string;
    width: number;
    height: number;
    className?: string;
};

export function TransitionalImage({ src, alt, width, height, className }: ImageProps) {
    const [currentSrc, setCurrentSrc] = useState(src);
    const [previousSrc, setPreviousSrc] = useState<string | undefined>();

    useEffect(() => {
        if (src !== currentSrc) {
            setPreviousSrc(currentSrc);
            setCurrentSrc(src);
        }
    }, [src, currentSrc]);

    return (
        <div className={className}>
            <AnimatePresence>
                {previousSrc && (
                    <motion.img
                        key={previousSrc}
                        src={previousSrc}
                        alt={alt}
                        width={width}
                        height={height}
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1 }}
                        className="absolute top-0 left-0 w-full h-full"
                    />
                )}
            </AnimatePresence>
            <motion.img
                key={currentSrc}
                src={currentSrc}
                alt={alt}
                width={width}
                height={height}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
                className="absolute top-0 left-0 w-full h-full"
            />
        </div>
    );
}
