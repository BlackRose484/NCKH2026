import { Question } from '@/types';

// 30 Psychology Questions - Fill-in-the-blank format
export const quizQuestions: Question[] = [
  // I. Gia đình (Family) - 10 questions
  {
    id: 1,
    question: "Cha của em là …",
    category: "Gia đình",
    placeholder: "Nhập câu trả lời của bạn..."
  },
  {
    id: 2,
    question: "Mẹ của em là …",
    category: "Gia đình",
    placeholder: "Nhập câu trả lời của bạn..."
  },
  {
    id: 3,
    question: "Cha và em …",
    category: "Gia đình",
    placeholder: "Nhập câu trả lời của bạn..."
  },
  {
    id: 4,
    question: "Mẹ và em …",
    category: "Gia đình",
    placeholder: "Nhập câu trả lời của bạn..."
  },
  {
    id: 5,
    question: "Em thích cha vì …",
    category: "Gia đình",
    placeholder: "Nhập câu trả lời của bạn..."
  },
  {
    id: 6,
    question: "Em thích mẹ vì …",
    category: "Gia đình",
    placeholder: "Nhập câu trả lời của bạn..."
  },
  {
    id: 7,
    question: "Em không thích cha vì …",
    category: "Gia đình",
    placeholder: "Nhập câu trả lời của bạn..."
  },
  {
    id: 8,
    question: "Em không thích mẹ vì …",
    category: "Gia đình",
    placeholder: "Nhập câu trả lời của bạn..."
  },
  {
    id: 9,
    question: "Em mong gia đình em …",
    category: "Gia đình",
    placeholder: "Nhập câu trả lời của bạn..."
  },
  {
    id: 10,
    question: "Cha mẹ nghĩ rằng em là …",
    category: "Gia đình",
    placeholder: "Nhập câu trả lời của bạn..."
  },

  // II. Trường học – Bạn bè (School - Friends) - 10 questions
  {
    id: 11,
    question: "Em và bạn của em …",
    category: "Trường học - Bạn bè",
    placeholder: "Nhập câu trả lời của bạn..."
  },
  {
    id: 12,
    question: "Thầy cô của em là …",
    category: "Trường học - Bạn bè",
    placeholder: "Nhập câu trả lời của bạn..."
  },
  {
    id: 13,
    question: "Ở trường, em cảm thấy …",
    category: "Trường học - Bạn bè",
    placeholder: "Nhập câu trả lời của bạn..."
  },
  {
    id: 14,
    question: "Hầu hết các bạn của em …",
    category: "Trường học - Bạn bè",
    placeholder: "Nhập câu trả lời của bạn..."
  },
  {
    id: 15,
    question: "Thầy cô và em …",
    category: "Trường học - Bạn bè",
    placeholder: "Nhập câu trả lời của bạn..."
  },
  {
    id: 16,
    question: "Một người bạn thật sự là …",
    category: "Trường học - Bạn bè",
    placeholder: "Nhập câu trả lời của bạn..."
  },
  {
    id: 17,
    question: "Em cảm thấy thầy cô …",
    category: "Trường học - Bạn bè",
    placeholder: "Nhập câu trả lời của bạn..."
  },
  {
    id: 18,
    question: "Em thấy các bài kiểm tra trên lớp …",
    category: "Trường học - Bạn bè",
    placeholder: "Nhập câu trả lời của bạn..."
  },
  {
    id: 19,
    question: "Em mong đợi bạn bè sẽ …",
    category: "Trường học - Bạn bè",
    placeholder: "Nhập câu trả lời của bạn..."
  },
  {
    id: 20,
    question: "Hầu hết thầy cô đều …",
    category: "Trường học - Bạn bè",
    placeholder: "Nhập câu trả lời của bạn..."
  },

  // III. Bản thân (Self) - 10 questions
  {
    id: 21,
    question: "Em sợ …",
    category: "Bản thân",
    placeholder: "Nhập câu trả lời của bạn..."
  },
  {
    id: 22,
    question: "Khi em sợ, em …",
    category: "Bản thân",
    placeholder: "Nhập câu trả lời của bạn..."
  },
  {
    id: 23,
    question: "Khi mọi việc không như ý, em …",
    category: "Bản thân",
    placeholder: "Nhập câu trả lời của bạn..."
  },
  {
    id: 24,
    question: "Em cảm thấy vui khi …",
    category: "Bản thân",
    placeholder: "Nhập câu trả lời của bạn..."
  },
  {
    id: 25,
    question: "Khi em vui, em …",
    category: "Bản thân",
    placeholder: "Nhập câu trả lời của bạn..."
  },
  {
    id: 26,
    question: "Em sẽ vui nếu em có thể …",
    category: "Bản thân",
    placeholder: "Nhập câu trả lời của bạn..."
  },
  {
    id: 27,
    question: "Em cảm thấy tức giận khi …",
    category: "Bản thân",
    placeholder: "Nhập câu trả lời của bạn..."
  },
  {
    id: 28,
    question: "Khi em tức giận, em …",
    category: "Bản thân",
    placeholder: "Nhập câu trả lời của bạn..."
  },
  {
    id: 29,
    question: "Em cảm thấy buồn khi …",
    category: "Bản thân",
    placeholder: "Nhập câu trả lời của bạn..."
  },
  {
    id: 30,
    question: "Khi em buồn, em …",
    category: "Bản thân",
    placeholder: "Nhập câu trả lời của bạn..."
  }
];

export const getQuestion = (id: number): Question | undefined => {
  return quizQuestions.find(q => q.id === id);
};

export const getTotalQuestions = (): number => {
  return quizQuestions.length;
};
