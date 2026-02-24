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

// ─────────────────────────────────────────────────────────────────────────────
// Bộ câu hỏi Tâm lý — 20 câu tự luận (Khảo sát Tâm lý)
// ─────────────────────────────────────────────────────────────────────────────
const psychologyQuestions: Question[] = [
  // I. Gia đình (1–7)
  { id: 1,  question: 'Em mong gia đình em',                                                   category: 'Gia đình',               placeholder: 'Ví dụ: luôn hạnh phúc, yêu thương nhau...' },
  { id: 2,  question: 'Cha mẹ nghĩ rằng em là',                                                category: 'Gia đình',               placeholder: 'Ví dụ: đứa con ngoan, chăm chỉ...' },
  { id: 3,  question: 'Người em hay trò chuyện, tâm sự nhất trong gia đình là',               category: 'Gia đình',               placeholder: 'Ví dụ: mẹ, ba, anh/chị...' },
  { id: 4,  question: 'Em không thích… trong gia đình',                                        category: 'Gia đình',               placeholder: 'Ví dụ: khi ba mẹ cãi nhau...' },
  { id: 5,  question: 'Ở nhà, em thường cảm thấy',                                             category: 'Gia đình',               placeholder: 'Ví dụ: thoải mái, vui vẻ, lo lắng...' },
  { id: 6,  question: 'Khi có chuyện không vui trong gia đình, em sẽ',                         category: 'Gia đình',               placeholder: 'Ví dụ: vào phòng một mình, xem phim...' },
  { id: 7,  question: 'Điều em mong cha mẹ hiểu ở em là',                                      category: 'Gia đình',               placeholder: 'Ví dụ: em cũng đang cố gắng...' },

  // II. Trường học – Thầy cô (8)
  { id: 8,  question: 'Em cảm thấy thầy cô',                                                   category: 'Thầy cô',                placeholder: 'Ví dụ: rất quan tâm đến học sinh...' },

  // II. Trường học – Bạn bè (9–10)
  { id: 9,  question: 'Hầu hết các bạn của em',                                                category: 'Bạn bè',                 placeholder: 'Ví dụ: rất thân thiện, hay giúp đỡ...' },
  { id: 10, question: 'Các bạn đối xử với em',                                                  category: 'Bạn bè',                 placeholder: 'Ví dụ: tốt bụng, đôi khi trêu đùa...' },

  // II. Trường học – Học tập (11–13)
  { id: 11, question: 'Em thấy việc học ở trường',                                              category: 'Học tập',                placeholder: 'Ví dụ: thú vị, khó, vừa sức...' },
  { id: 12, question: 'Em thấy các bài kiểm tra trên lớp',                                      category: 'Học tập',                placeholder: 'Ví dụ: căng thẳng, dễ, công bằng...' },
  { id: 13, question: 'Khi điểm kiểm tra không như mong muốn, em sẽ',                          category: 'Học tập',                placeholder: 'Ví dụ: buồn, cố gắng hơn lần sau...' },

  // II. Trường học – Hoạt động khác (14–16)
  { id: 14, question: 'Trong các giờ ra chơi hoặc hoạt động chung, em thường',                 category: 'Hoạt động trường học',   placeholder: 'Ví dụ: chơi với bạn, ngồi đọc sách...' },
  { id: 15, question: 'Khi gặp chuyện không như ý ở trường, em sẽ',                            category: 'Hoạt động trường học',   placeholder: 'Ví dụ: nói với thầy cô, kể với bạn...' },
  { id: 16, question: 'Ở trường, em cảm thấy',                                                  category: 'Hoạt động trường học',   placeholder: 'Ví dụ: vui, an toàn, áp lực...' },

  // III. Bản thân (17–20)
  { id: 17, question: 'Khi mọi việc không như ý, em',                                           category: 'Bản thân',               placeholder: 'Ví dụ: tìm cách giải quyết, buồn...' },
  { id: 18, question: 'Mọi người thường nhận xét em là',                                        category: 'Bản thân',               placeholder: 'Ví dụ: vui tính, chăm chỉ, hướng nội...' },
  { id: 19, question: 'Khi làm sai điều gì đó, em thường',                                      category: 'Bản thân',               placeholder: 'Ví dụ: xin lỗi, tự trách mình...' },
  { id: 20, question: 'Em nghĩ bản thân mình là người',                                         category: 'Bản thân',               placeholder: 'Ví dụ: tốt bụng, hay lo lắng...' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Bộ câu hỏi Học đường — 15 câu trắc nghiệm (Làm chủ cảm xúc)
// ─────────────────────────────────────────────────────────────────────────────
const emotionMasteryQuestions: Question[] = [
  // CD1. Biết ơn những người có công với quê hương, đất nước (1–5)
  {
    id: 1,
    question: 'Theo em, ai là người không có công với quê hương, đất nước?',
    category: 'Biết ơn người có công',
    type: 'multiple-choice',
    correctAnswer: 3, // D
    options: [
      'Người lính chiến đấu bảo vệ Tổ quốc',
      'Mẹ Việt Nam Anh hùng',
      'Người sáng lập nên một nghề (ông tổ nghề)',
      'Người chỉ quan tâm đến lợi ích cá nhân, không có đóng góp gì cho cộng đồng và xã hội',
    ],
  },
  {
    id: 2,
    question: 'Em không đồng tình với ý kiến nào sau đây?',
    category: 'Biết ơn người có công',
    type: 'multiple-choice',
    correctAnswer: 3, // D
    options: [
      'Những người có công với quê hương, đất nước là người mang lại hòa bình cho chúng ta',
      'Những người có đóng góp trong mọi lĩnh vực đều là người có công với quê hương, đất nước',
      'Đền ơn đáp nghĩa là trách nhiệm của mọi công dân',
      'Việc đền ơn đáp nghĩa chỉ là trách nhiệm của Nhà nước và người lớn tuổi',
    ],
  },
  {
    id: 3,
    question: 'Em không đồng tình với ý kiến nào sau đây?',
    category: 'Biết ơn người có công',
    type: 'multiple-choice',
    correctAnswer: 2, // C
    options: [
      'Phải quan tâm, chăm sóc những gia đình thương binh, liệt sĩ mới là biết ơn người có công với quê hương, đất nước',
      'Học tập chăm chỉ để trở thành người có ích cho xã hội cũng là biết ơn người có công với quê hương, đất nước',
      'Chúng ta cần biết ơn người có công với quê hương, đất nước là những người nổi tiếng',
      'Chúng ta cần biết ơn cả những người có đóng góp thầm lặng trong cuộc sống hằng ngày cho quê hương, đất nước',
    ],
  },
  {
    id: 4,
    question: 'Việc làm nào dưới đây không thể hiện lòng biết ơn người có công với quê hương, đất nước?',
    category: 'Biết ơn người có công',
    type: 'multiple-choice',
    correctAnswer: 2, // C
    options: [
      'Chăm sóc Bà mẹ Việt Nam Anh hùng',
      'Cố gắng học giỏi để sau này góp phần xây dựng quê hương giàu đẹp',
      'Tham gia các hoạt động vui chơi, giải trí',
      'Tìm hiểu, tuyên truyền về lịch sử quê hương',
    ],
  },
  {
    id: 5,
    question: 'Thái độ, hành vi của bạn nào dưới đây chưa phù hợp?',
    category: 'Biết ơn người có công',
    type: 'multiple-choice',
    correctAnswer: 0, // A
    options: [
      'Giờ ra chơi, Thắng lấy bút tô màu và vẽ thêm râu, tóc vào ảnh một danh nhân trong sách giáo khoa',
      'Vân thích tìm hiểu lịch sử dân tộc, đặc biệt là đọc truyện về các anh hùng đất Việt',
      'Thảo và các bạn cùng khu phố đến chia buồn và giúp đỡ gia đình người lính cứu hỏa đã hi sinh khi làm nhiệm vụ',
      'Kha nhiệt tình tham gia cuộc thi "Tìm hiểu về những người có công với quê hương, đất nước" do nhà trường phát động',
    ],
  },

  // CD2. Tôn trọng sự khác biệt của người khác (6–9)
  {
    id: 6,
    question: 'Em tán thành với ý kiến nào sau đây?',
    category: 'Tôn trọng sự khác biệt',
    type: 'multiple-choice',
    correctAnswer: 0, // A
    options: [
      'Sự khác biệt của mỗi người tạo nên sắc màu đa dạng cho cuộc sống',
      'Các bạn nữ không nên chơi cùng với các bạn nam',
      'Chỉ nên chơi với những bạn có cùng hoàn cảnh với mình',
      'Không cần quan tâm đến sự khác biệt của người khác',
    ],
  },
  {
    id: 7,
    question: 'Em không tán thành với ý kiến nào sau đây?',
    category: 'Tôn trọng sự khác biệt',
    type: 'multiple-choice',
    correctAnswer: 2, // C
    options: [
      'Mỗi dân tộc đều có những giá trị văn hóa đặc trưng cần được trân trọng và gìn giữ',
      'Cần tôn trọng sự khác biệt về sở thích, tính cách của mỗi người',
      'Các bạn nữ không nên chơi cùng với các bạn nam',
      'Sự khác biệt giúp con người học hỏi lẫn nhau',
    ],
  },
  {
    id: 8,
    question: 'Việc làm nào dưới đây thể hiện sự tôn trọng sự khác biệt của người khác?',
    category: 'Tôn trọng sự khác biệt',
    type: 'multiple-choice',
    correctAnswer: 0, // A
    options: [
      'Phong đứng ra bênh vực Tân khi bạn bị trêu chọc vì vóc dáng nhỏ bé',
      'Không ủng hộ em gái học nhạc cụ dân tộc vì thích đàn pi-a-nô',
      'Chê bai bạn vì nói giọng địa phương',
      'Tránh chơi với những bạn có sở thích khác mình',
    ],
  },
  {
    id: 9,
    question: 'Việc làm nào dưới đây chưa thể hiện sự tôn trọng sự khác biệt?',
    category: 'Tôn trọng sự khác biệt',
    type: 'multiple-choice',
    correctAnswer: 2, // C
    options: [
      'Nga chủ động bắt chuyện để Linh tự tin hơn khi mới chuyển trường',
      'Tú vui vẻ tham gia đá bóng cùng các bạn dù điều kiện chơi khác nơi mình sống',
      'Không ủng hộ em gái đăng kí học nhạc cụ dân tộc vì sở thích cá nhân',
      'Tôn trọng phong tục tập quán của các dân tộc khác',
    ],
  },

  // CD3. Vượt qua khó khăn (10–12)
  {
    id: 10,
    question: 'Em không đồng tình với ý kiến nào sau đây?',
    category: 'Vượt qua khó khăn',
    type: 'multiple-choice',
    correctAnswer: 0, // A
    options: [
      'Trẻ em không thể tự vượt qua khó khăn',
      'Khi không tự giải quyết được khó khăn, cần tìm sự hỗ trợ từ người đáng tin cậy',
      'Vượt khó giúp con người trưởng thành hơn',
      'Vượt khó giúp ta có thêm kinh nghiệm sống',
    ],
  },
  {
    id: 11,
    question: 'Em không đồng tình với ý kiến nào sau đây?',
    category: 'Vượt qua khó khăn',
    type: 'multiple-choice',
    correctAnswer: 0, // A
    options: [
      'Chỉ người nghèo mới cần vượt khó',
      'Tinh thần vượt khó có thể rèn luyện được',
      'Vượt khó sẽ giúp ta thành công và có nhiều niềm vui trong cuộc sống',
      'Vượt khó giúp con người mạnh mẽ hơn',
    ],
  },
  {
    id: 12,
    question: 'Em không đồng tình với ý kiến nào sau đây?',
    category: 'Vượt qua khó khăn',
    type: 'multiple-choice',
    correctAnswer: 0, // A
    options: [
      'Vượt khó sẽ khiến bản thân luôn mệt mỏi, dễ chán nản',
      'Cần kiên trì khi gặp khó khăn',
      'Không nên bỏ cuộc khi gặp thử thách',
      'Vượt qua khó khăn giúp ta tự tin hơn',
    ],
  },

  // CD4. Bảo vệ cái đúng, cái tốt (13–15)
  {
    id: 13,
    question: 'Em tán thành với ý kiến nào sau đây?',
    category: 'Bảo vệ cái đúng, cái tốt',
    type: 'multiple-choice',
    correctAnswer: 0, // A
    options: [
      'Bảo vệ cái đúng, cái tốt là những việc làm có ích cho người khác và xã hội',
      'Trẻ em chưa đủ khả năng để bảo vệ cái đúng, cái tốt',
      'Không cần quan tâm đến cái đúng, cái tốt nếu không liên quan đến mình',
      'Bảo vệ cái đúng, cái tốt là việc của người lớn',
    ],
  },
  {
    id: 14,
    question: 'Em không tán thành với ý kiến nào sau đây?',
    category: 'Bảo vệ cái đúng, cái tốt',
    type: 'multiple-choice',
    correctAnswer: 2, // C
    options: [
      'Cần ủng hộ những người thực hiện cái đúng, cái tốt',
      'Nếu không bảo vệ cái đúng, cái tốt thì cái sai, cái xấu sẽ lấn át',
      'Không cần nói ra cái sai của bạn để tránh mất lòng',
      'Bảo vệ cái đúng, cái tốt giúp cuộc sống an toàn, lành mạnh hơn',
    ],
  },
  {
    id: 15,
    question: 'Cách làm nào dưới đây phù hợp để bảo vệ cái đúng, cái tốt?',
    category: 'Bảo vệ cái đúng, cái tốt',
    type: 'multiple-choice',
    correctAnswer: 1, // B
    options: [
      'Chỉ lên án cái xấu khi liên quan đến mình',
      'Ủng hộ và bênh vực bạn khi bạn làm điều đúng nhưng bị chê bai',
      'Im lặng trước cái sai để giữ hòa khí',
      'Tránh xa những việc tốt vì sợ phiền phức',
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Quiz Sets Registry
// ─────────────────────────────────────────────────────────────────────────────
export const quizSets: QuizSet[] = [
  {
    id: 'psychology-v1',
    name: 'Khảo sát Tâm lý',
    description: 'Bộ câu hỏi giúp hiểu rõ tâm trạng và cảm xúc của học sinh về gia đình, trường học và bản thân',
    category: 'Tâm lý',
    totalQuestions: 20,
    estimatedMinutes: 15,
    icon: '🧠',
    color: 'from-purple-500 to-pink-500',
    questions: psychologyQuestions,
  },
  {
    id: 'emotion-mastery-v1',
    name: 'Làm chủ cảm xúc',
    description: 'Bộ câu hỏi học đường giúp đánh giá nhận thức và hành vi đạo đức của học sinh',
    category: 'Học đường',
    totalQuestions: 15,
    estimatedMinutes: 10,
    icon: '🎯',
    color: 'from-orange-500 to-rose-500',
    questions: emotionMasteryQuestions,
  },
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
