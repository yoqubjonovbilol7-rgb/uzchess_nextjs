'use client';

import axios from "axios";
import { useEffect } from "react";

interface Props {
    userId: number;
    newsId: number;
}

export default function NewsView({userId, newsId,}: Props) {
    useEffect(() => {

        axios.get(`http://localhost:3001/public/newsViews?userId=${userId}&newsId=${newsId}`);

    }, [userId, newsId]);

    return null;
}