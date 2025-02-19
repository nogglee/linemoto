module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        title: ['Paperlogy', 'sans-serif'], // 타이틀 폰트 패밀리 설정
        body: ['Pretendard', 'sans-serif'], // 본문 폰트 패밀리 설정
      },
      fontWeight: {
        100: '100',
        200: '200',
        300: '300',
        400: '400',
        500: '500',
        600: '600',
        700: '700',
        800: '800',
        900: '900',
      },
      colors: {
        red: {
          500: '#EE5D50',
          400: '#E67A74',
          100: '#FDECF1',
          50: '#FDF6F8',
        },
        blue: {
          500: '#2C78FF',
        },
        yellow: {
          500: '#FF980F',
          50: '#FFF5E7',
        },
        green: {
          500: '#59BD83',
          400: '#7FCCA0',
          300: '#A4DBBB',
          200: '#DEF2E6',
          100: '#EDF8F1',
        },
        brown: {
          900: '#623112',
          700: '#A55A00',
          400: '#C08B4D',
        },
        purple: {
          500: '#7B5DE9',
          50: '#F2EFFD'
        },
        gray: {
          950: '#17191D',
          900: '#2D3139',
          800: '#3F4550',
          700: '#58606F',
          600: '#7C8597',
          500: '#9BA2B0',
          400: '#AAB0BB',
          300: '#C0C5CD',
          200: '#E3E5E8',
          100: '#F4F4F6',
          50: '#F9FAFA',
        }
      },
    },
  },
  plugins: [],
  variants: {
    scrollbar: ['rounded']
  },
  // 스크롤바 관련 유틸리티 클래스 추가
  utilities: {
    '.scrollbar-hide': {
      /* IE and Edge */
      '-ms-overflow-style': 'none',
      /* Firefox */
      'scrollbar-width': 'none',
      /* Safari and Chrome */
      '&::-webkit-scrollbar': {
        display: 'none'
      }
    }
  }
};