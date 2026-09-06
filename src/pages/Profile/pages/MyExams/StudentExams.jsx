import { useState, useEffect } from "react";
import { useSearchParams } from "react-router"; // أو react-router-dom حسب مشروعك
import { useTranslation } from "react-i18next";
import ProfileTitle from "@/components/common/ProfileTitle";
import MyExamsSkeleton from "@/components/Loading/SkeletonLoading/MyExamsSkeleton";
import { useQuery } from "@tanstack/react-query";
import { getExamsCourses, getExamsStudent } from "@/api/ExamServices";
import EmptyDataSection from "@/components/sections/EmptyDataSection";
import MainPagination from "@/components/common/MainPagination";
import ExamCard from "@/components/cards/ExamCard";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Custom Hook للـ Debounce الخاص بالبحث باسم الاختبار
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const StudentExams = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  // قراءة القيم الحالية من الـ URL للحفاظ عليها عند تحديث الصفحة
  const currentSearch = searchParams.get("search") || "";
  const currentStatus = searchParams.get("status") || "all";
  const currentCourse = searchParams.get("course_id") || "all"; // قراءة فلتر الكورس
  const currentPage = Number(searchParams.get("page")) || 1;

  // إدارة حالة حقل البحث محلياً
  const [searchInput, setSearchInput] = useState(currentSearch);
  const debouncedSearch = useDebounce(searchInput, 500);

  // جلب قائمة الكورسات
  const { data: examsCourses, isLoading: isLoadingCourses } = useQuery({
    queryKey: ["examsCourses"],
    queryFn: getExamsCourses,
  });

  // دالة تحديث الفلاتر الشاملة في الـ URL
  const updateFilters = (key, value) => {
    const newParams = new URLSearchParams(searchParams);

    if (value && value !== "all") {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }

    // تصفير الصفحة إلى 1 عند تغيير أي فلتر آخر
    if (key !== "page") {
      newParams.delete("page");
    }

    setSearchParams(newParams);
  };

  // مزامنة قيمة البحث الفعلي بعد انتهاء الـ Debounce
  useEffect(() => {
    updateFilters("search", debouncedSearch);
  }, [debouncedSearch]);

  // تحديث حقل الإدخال إذا تغير الـ URL من الخارج
  useEffect(() => {
    setSearchInput(currentSearch);
  }, [currentSearch]);

  // جلب البيانات بناءً على الفلاتر من الـ URL (إضافة currentCourse)
  const { data: exams, isLoading } = useQuery({
    queryKey: [
      "examsStudent",
      currentSearch,
      currentStatus,
      currentCourse,
      currentPage,
    ],
    queryFn: () =>
      getExamsStudent({
        search: currentSearch || undefined,
        status: currentStatus !== "all" ? currentStatus : undefined,
        course_id: currentCourse !== "all" ? currentCourse : undefined, // إرسال course_id للباك إند
        page: currentPage,
      }),
  });

  const isEmpty = !isLoading && (!exams?.items || exams?.items?.length === 0);
  const totalPages = exams?.meta?.last_page || 1;

  const examStatus = [
    {
      value: "all",
      label: t("myExams.all"),
    },
    {
      value: "coming",
      label: t("myExams.status.coming"),
    },
    {
      value: "ended",
      label: t("myExams.status.ended"),
    },
    {
      value: "retry_available",
      label: t("myExams.status.retry_available"),
    },
  ];

  return (
    <div className="space-y-6">
      <ProfileTitle title={t("myExams.title")} />

      {/* قسم الفلاتر والبحث (تعديل الشبكة لتصبح 3 أعمدة بدلاً من 2) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-card rounded-lg border">
        {/* حقل البحث باسم الاختبار */}
        <div>
          <label className="text-sm font-medium inline-block mb-2">
            {t("myExams.searchLabel")}
          </label>
          <Input
            type="text"
            placeholder={t("myExams.searchPlaceholder")}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>

        {/* فلتر الكورس (الجديد) */}
        <div>
          <label className="text-sm font-medium inline-block mb-2">
            {t("myExams.courseLabel")}
          </label>
          <Select
            value={currentCourse}
            onValueChange={(val) => updateFilters("course_id", val)}
            disabled={isLoadingCourses}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t("myExams.coursePlaceholder")} />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectGroup>
                <SelectItem value="all">{t("myExams.allCourses")}</SelectItem>
                {examsCourses?.map((course) => (
                  <SelectItem key={course.id} value={String(course.id)}>
                    {course.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* فلتر حالة الاختبار */}
        <div>
          <label className="text-sm font-medium inline-block mb-2">
            {t("myExams.statusLabel")}
          </label>
          <Select
            value={currentStatus}
            onValueChange={(val) => updateFilters("status", val)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t("myExams.statusPlaceholder")} />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectGroup>
                {examStatus.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* عرض البيانات أو حالات التحميل والبيانات الفارغة */}
      {isLoading ? (
        <MyExamsSkeleton />
      ) : isEmpty ? (
        <EmptyDataSection msg={t("myExams.emptyMessage")} />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {exams?.items?.map((item) => (
              <ExamCard key={item.id} item={item} />
            ))}
          </div>

          <div className="flex justify-center pt-4">
            <MainPagination
              totalPages={totalPages}
              currentPage={currentPage}
              onPageChange={(newPage) => updateFilters("page", newPage)}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default StudentExams;
