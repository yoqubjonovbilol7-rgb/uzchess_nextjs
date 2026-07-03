import Image from 'next/image';

export default function Footer() {

    return (

        <footer className="
            w-full
            bg-[#111315]
            border-t
            border-[#1B1E21]
            text-white
            py-10
            mt-10
        ">

            <div className="
                w-full
                max-w-[1700px]
                mx-auto
                px-8
                flex
                flex-col
                items-center
            ">

                <div className="
                    flex
                    items-center
                    justify-center
                    mb-6
                ">

                   <div className="relative w-24 h-24">
                        <Image
                            src="/Group.png"
                            alt="UzChess"
                            fill
                            style={{ objectFit: 'contain' }}
                        />
                    </div>

                </div>

                <div className="flex flex-wrap
                    justify-center
                    gap-4
                    md:gap-8
                    text-sm
                    md:text-base
                    text-gray-400
                    mb-8
                    text-center
                ">

                    <a
                        href="#"
                        className="hover:text-white  transition" >
                        Biz haqimizda
                    </a>

                    <a
                        href="#"
                        className="hover:text-white  transition" >
                        Cookie fayllari siyosati
                    </a>

                    <a href="#"
                       className="hover:text-white  transition" >

                        Foydalanish qoidalari
                    </a>

                </div>


                <div className="
                    flex
                    items-center
                    justify-center
                    gap-6
                    mb-10
                    flex-wrap
                ">

                    <a href="https://t.me/uzchesss">

                        <Image
                            src="/telegram.png"
                            alt="Telegram"
                            width={24}
                            height={24}
                            className="hover:opacity-80 transition" />

                    </a>

                    <a href="https://instagram.com/uzchesss">

                        <Image
                            src="/instagram.png"
                            alt="Instagram"
                            width={24}
                            height={24}
                            className="hover:opacity-80 transition" />

                    </a>

                    <a href="http://youtube.com/@uzchesss">

                        <Image
                            src="/youtube.png"
                            alt="YouTube"
                            width={24}
                            height={24}
                            className="hover:opacity-80 transition" />

                    </a>

                    <a href="https://www.facebook.com/uzchessofficial/">

                        <Image
                            src="/facebook.png"
                            alt="Facebook"
                            width={24}
                            height={24}
                            className="hover:opacity-80 transition" />

                    </a>

                    <a href="https://x.com/Uzchesss">

                        <Image
                            src="/twitter.png"
                            alt="Twitter"
                            width={24}
                            height={24}
                            className="hover:opacity-80 transition" />

                    </a>

                </div>


                <div className="
                    w-full
                    border-t
                    border-[#1B1E21]
                    pt-6
                    flex
                    flex-col
                    md:flex-row
                    items-center
                    justify-between
                    gap-4
                    text-sm
                    md:text-base
                    text-gray-500
                    text-center
                ">

                    <p>© UzChess. All rights reserved.</p>

                    <p>Foydalanish qoidalari</p>

                </div>

            </div>

        </footer>

    );

}