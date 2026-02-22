import { EmotionType } from '@/types';

// Emotion configuration with messages and character images
export const emotionConfig: Record<EmotionType, {
  message: string;
  character: string;
  color: string;
  bgColor: string;
}> = {
  Happiness: {
    message: "Bạn rất vui vẻ và tích cực! 🎉 Thật tuyệt vời!",
    character: "/boy.svg",
    color: "text-green-600",
    bgColor: "bg-green-50"
  },
  Neutral: {
    message: "Bạn rất tập trung và bình tĩnh! 🧘 Tuyệt lắm!",
    character: "/robot.svg",
    color: "text-blue-600",
    bgColor: "bg-blue-50"
  },
  Surprise: {
    message: "Bạn có vẻ ngạc nhiên! 😲 Thật thú vị phải không?",
    character: "/woman.svg",
    color: "text-yellow-600",
    bgColor: "bg-yellow-50"
  },
  Sadness: {
    message: "Đừng buồn nhé! 💪 Lần sau sẽ tốt hơn!",
    character: "/mascot_sad.svg",
    color: "text-indigo-600",
    bgColor: "bg-indigo-50"
  },
  Anger: {
    message: "Hãy bình tĩnh nào! 😊 Bạn đã cố gắng rất tốt rồi!",
    character: "/mascot_bad.svg",
    color: "text-red-600",
    bgColor: "bg-red-50"
  },
  Fear: {
    message: "Đừng lo lắng! 🌟 Bạn làm rất tốt rồi!",
    character: "/zombie.svg",
    color: "text-purple-600",
    bgColor: "bg-purple-50"
  },
  Disgust: {
    message: "Không sao đâu! 🌈 Hãy thử lại nhé!",
    character: "/man.svg",
    color: "text-orange-600",
    bgColor: "bg-orange-50"
  }
};

export const getEmotionConfig = (emotion: EmotionType) => {
  return emotionConfig[emotion];
};

