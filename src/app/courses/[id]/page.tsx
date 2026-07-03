import CourseDetail from "@/features/course/components/CourseDetail";

interface PageProps {params: Promise<{ id: string; }>;}

export default async function Page({ params }: PageProps) {
    const { id } = await params;

    let course;
    try {
        const res = await fetch(
            `http://localhost:3001/public/courses/${id}`,
            { cache: "no-store" }
        );
        if (!res.ok) {
            return <div className="p-10 text-center text-white">Kurs topilmadi</div>;
        }
        course = await res.json();
    } catch {
        return <div className="p-10 text-center text-white">Server bilan bog&apos;lanib bo&apos;lmadi</div>;
    }

    return <CourseDetail course={course} />;
}