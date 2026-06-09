import CourseDetail from "@/features/course/components/CourseDetail";

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function Page({ params }: PageProps) {
    const { id } = await params;

    const res = await fetch(
        `http://localhost:3001/public/courses/${id}`,
        {
            cache: "no-store",
        }
    );

    if (!res.ok) {
        return (
            <div className="p-10 text-center text-white">
                Kurs topilmadi
            </div>
        );
    }

    const course = await res.json();

    return <CourseDetail course={course} />;
}