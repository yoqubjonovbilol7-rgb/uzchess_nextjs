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

                    <img
                        src="/Group.png"
                        alt="UzChess"
                        className="w-[80px]"
                    />

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

                        <img
                            src="/telegram.png"
                            alt="Telegram"
                            className="w-6 h-6 hover:opacity-80 transition " />

                    </a>

                    <a href="https://instagram.com/uzchesss">

                        <img
                            src="/instagram.png"
                            alt="Instagram"
                            className="w-6 h-6 hover:opacity-80 transition " />

                    </a>

                    <a href="http://youtube.com/@uzchesss">

                        <img
                            src="/youtube.png"
                            alt="YouTube"
                            className="w-6 h-6 hover:opacity-80 transition " />

                    </a>

                    <a href="https://www.facebook.com/uzchessofficial/">

                        <img
                            src="/facebook.png"
                            alt="Facebook"
                            className="w-6 h-6 hover:opacity-80 transition " />

                    </a>

                    <a href="https://x.com/Uzchesss">

                        <img
                            src="/twitter.png"
                            alt="Twitter"
                            className="w-6 h-6 hover:opacity-80 transition " />

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