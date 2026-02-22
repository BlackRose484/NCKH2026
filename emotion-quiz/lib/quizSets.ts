import { Question } from '@/types';

export interface QuizSet {
  id: string;
  name: string;
  description: string;
  category: string;
  totalQuestions: number;
  estimatedMinutes: number;
  icon: string;
  color: string;
  questions: Question[];
}

// Psychology Quiz (existing)
const psychologyQuestions: Question[] = [
  // Gia đình (1-10)
  { id: 1, question: 'Cha của em là', category: 'Gia đình', placeholder: 'Ví dụ: người tốt, nghiêm khắc...' },
  { id: 2, question: 'Mẹ của em là', category: 'Gia đình', placeholder: 'Ví dụ: người hiền lành, chu đáo...' },
  { id: 3, question: 'Cha và em', category: 'Gia đình', placeholder: 'Ví dụ: rất thân thiết, ít nói chuyện...' },
  { id: 4, question: 'Mẹ và em', category: 'Gia đình', placeholder: 'Ví dụ: hay trò chuyện, hiểu nhau...' },
  { id: 5, question: 'Em thích cha vì', category: 'Gia đình', placeholder: 'Ví dụ: cha luôn quan tâm em...' },
  { id: 6, question: 'Em thích mẹ vì', category: 'Gia đình', placeholder: 'Ví dụ: mẹ luôn lắng nghe em...' },
  { id: 7, question: 'Em không thích cha vì', category: 'Gia đình', placeholder: 'Ví dụ: cha quá nghiêm khắc...' },
  { id: 8, question: 'Em không thích mẹ vì', category: 'Gia đình', placeholder: 'Ví dụ: mẹ hay la mắng...' },
  { id: 9, question: 'Em mong gia đình em', category: 'Gia đình', placeholder: 'Ví dụ: luôn hạnh phúc, đi du lịch...' },
  { id: 10, question: 'Cha mẹ nghĩ rằng em là', category: 'Gia đình', placeholder: 'Ví dụ: đứa con ngoan, chăm chỉ...' },

  // Trường học – Bạn bè (11-20)
  { id: 11, question: 'Em và bạn của em', category: 'Trường học – Bạn bè', placeholder: 'Ví dụ: rất thân thiết, hay chơi cùng...' },
  { id: 12, question: 'Thầy cô của em là', category: 'Trường học – Bạn bè', placeholder: 'Ví dụ: tốt bụng, tận tâm...' },
  { id: 13, question: 'Ở trường, em cảm thấy', category: 'Trường học – Bạn bè', placeholder: 'Ví dụ: vui vẻ, thoải mái, căng thẳng...' },
  { id: 14, question: 'Hầu hết các bạn của em', category: 'Trường học – Bạn bè', placeholder: 'Ví dụ: rất thân thiện, hay giúp đỡ...' },
  { id: 15, question: 'Thầy cô và em', category: 'Trường học – Bạn bè', placeholder: 'Ví dụ: có mối quan hệ tốt...' },
  { id: 16, question: 'Một người bạn thật sự là', category: 'Trường học – Bạn bè', placeholder: 'Ví dụ: người luôn ở bên em...' },
  { id: 17, question: 'Em cảm thấy thầy cô', category: 'Trường học – Bạn bè', placeholder: 'Ví dụ: rất quan tâm học sinh...' },
  { id: 18, question: 'Em thấy các bài kiểm tra trên lớp', category: 'Trường học – Bạn bè', placeholder: 'Ví dụ: khó, dễ, căng thẳng...' },
  { id: 19, question: 'Em mong đợi bạn bè sẽ', category: 'Trường học – Bạn bè', placeholder: 'Ví dụ: luôn ở bên em, hiểu em...' },
  { id: 20, question: 'Hầu hết thầy cô đều', category: 'Trường học – Bạn bè', placeholder: 'Ví dụ: tốt bụng, công bằng...' },

  // Bản thân (21-30)
  { id: 21, question: 'Em sợ', category: 'Bản thân', placeholder: 'Ví dụ: bóng tối, côn trùng...' },
  { id: 22, question: 'Khi em sợ, em', category: 'Bản thân', placeholder: 'Ví dụ: khóc, tìm mẹ, trốn...' },
  { id: 23, question: 'Khi mọi việc không như ý, em', category: 'Bản thân', placeholder: 'Ví dụ: buồn, tức giận, bình tĩnh...' },
  { id: 24, question: 'Em cảm thấy vui khi', category: 'Bản thân', placeholder: 'Ví dụ: được khen, chơi với bạn...' },
  { id: 25, question: 'Khi em vui, em', category: 'Bản thân', placeholder: 'Ví dụ: cười nhiều, nhảy múa...' },
  { id: 26, question: 'Em sẽ vui nếu em có thể', category: 'Bản thân', placeholder: 'Ví dụ: đi chơi, có đồ chơi mới...' },
  { id: 27, question: 'Em cảm thấy tức giận khi', category: 'Bản thân', placeholder: 'Ví dụ: bị la mắng, bị bắt nạt...' },
  { id: 28, question: 'Khi em tức giận, em', category: 'Bản thân', placeholder: 'Ví dụ: la hét, khóc, im lặng...' },
  { id: 29, question: 'Em cảm thấy buồn khi', category: 'Bản thân', placeholder: 'Ví dụ: bị mắng, thất bại...' },
  { id: 30, question: 'Khi em buồn, em', category: 'Bản thân', placeholder: 'Ví dụ: khóc, tự ở một mình...' },
];

// Quiz Sets Registry
export const quizSets: QuizSet[] = [
  {
    id: 'psychology-v1',
    name: 'Khảo sát Tâm lý',
    description: 'Bộ câu hỏi giúp hiểu rõ tâm trạng và cảm xúc của bạn về gia đình, trường học và bản thân',
    category: 'Tâm lý',
    totalQuestions: 30,
    estimatedMinutes: 15,
    icon: '🧠',
    color: 'from-purple-500 to-pink-500',
    questions: psychologyQuestions,
  },
  // More quiz sets can be added here in the future
];

// Helper function to get quiz set by ID
export function getQuizSetById(id: string): QuizSet | undefined {
  return quizSets.find(quiz => quiz.id === id);
}

// Helper function to get all available quiz sets
export function getAllQuizSets(): QuizSet[] {
  return quizSets;
}

// Default quiz set (for backward compatibility)
export const defaultQuizSet = quizSets[0];
