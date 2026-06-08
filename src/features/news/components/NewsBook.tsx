import Image from "next/image";

interface BookItemProps {
    image: string;
    title: string;
    author: string;
}

export default function NewsBook({ image, title, author }: BookItemProps) {
    return (
        <div className="flex gap-3 items-start group ">
            <Image
                src={image}
                alt={`${title} kitob muqovasi`}
                width={64}
                height={80}
                className= "object-cover rounded-md shrink-0 group-hover"
            />

            <div className="flex flex-col">
                <h3 className="text-sm font-medium leading-5 text-white">
                    {title}
                </h3>
                <p className="text-sm text-gray-400 mt-1">
                    {author}
                </p>
            </div>
        </div>
    );
}