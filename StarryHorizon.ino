#include <MyWatchy.h>
#include <GxEPD2.h>
#include <Fonts/FreeSansBold9pt7b.h>
#include "MadeSunflower39pt7b.h"
#include "stars.h"
#include "settings.h"

#define STAR_COUNT 900

const int horizonY = 150;
const int planetR = 650;

struct xyPoint {
  int x;
  int y;
};

void initStars() {
 
  srand(5287);
  printf("const Star STARS[] PROGMEM = {\n");
  for(int i = 0; i < STAR_COUNT; i++) {
    int starX = (rand() % 260) - 30;
    int starY = (rand() % 260) - 30;
    int radius = 0;
    if (i > STAR_COUNT * 0.99) radius = 2;
    else if (i > STAR_COUNT * 0.80) radius = 1;
    printf("  { %d, %d, %d },\n", starX, starY, radius);
  }
  printf("};\n");
}

struct xyPoint rotatePointAround(int x, int y, int ox, int oy, double angle) {
  double qx = (double)ox + (cos(angle) * (double)(x - ox)) + (sin(angle) * (double)(y - oy));
  double qy = (double)oy + (-sin(angle) * (double)(x - ox)) + (cos(angle) * (double)(y - oy));
  struct xyPoint newPoint;
  newPoint.x = (int)qx;
  newPoint.y = (int)qy;
  return newPoint;
}

class StarryHorizon : public Watchy {
    public:
        StarryHorizon(const watchySettings& s) : Watchy(s) {
          // uncomment to re-generate stars
          // initStars();
        }
        void drawWatchFace(){
          uint8_t direction = sensor.getDirection();
          switch (direction) {
            case DIRECTION_DISP_DOWN:
              display.fillScreen(GxEPD_BLACK);
              display.fillCircle(100, horizonY + planetR, planetR, GxEPD_WHITE);
              drawGrid();
              drawStars(STARS);
              drawTime();
              drawDate();
              break;
            case DIRECTION_DISP_UP:
              display.setRotation(0);
              display.fillScreen(GxEPD_BLACK);
              display.fillCircle(100, horizonY + planetR, planetR, GxEPD_WHITE);
              drawGrid();
              drawStars(STARS);
              drawTime();
              drawDate();
              break;
            case DIRECTION_BOTTOM_EDGE:
              display.setRotation(2);
              display.fillScreen(GxEPD_BLACK);
              display.fillCircle(100, horizonY + planetR, planetR, GxEPD_WHITE);
              drawGrid();
              drawStars(STARS);
              drawTime();
              drawDate();
              break;
            case DIRECTION_TOP_EDGE:
              display.setRotation(0);
              display.fillScreen(GxEPD_BLACK);
              display.fillCircle(100, horizonY + planetR, planetR, GxEPD_WHITE);
              drawGrid();
              drawStars(STARS);
              drawTime();
              drawDate();
              break;
            case DIRECTION_RIGHT_EDGE:
            /*
              display.setRotation(1);
              display.fillScreen(GxEPD_BLACK);
              display.fillCircle(100, horizonY + planetR, planetR, GxEPD_WHITE);
              drawGrid();
              drawStars(STARS);
              drawTime();
              drawDate();
              break;
              */
              display.fillScreen(GxEPD_BLACK);
            case DIRECTION_LEFT_EDGE:
              display.setRotation(3);
              display.fillScreen(GxEPD_BLACK);
              display.fillCircle(100, horizonY + planetR, planetR, GxEPD_WHITE);
              drawGrid();
              drawStars(STARS);
              drawTime();
              drawDate();
              break;
            default:
               break;
              }
        }
        void drawGrid() {
          int prevY = horizonY;
          for(int i = 0; i < 40; i+= 1) {
            int y = prevY + int(abs(sin(double(i) / 10) * 10));
            if(y <= 200) {
              display.drawFastHLine(0, y, 200, GxEPD_BLACK);
            }
            prevY = y;
          }
          int vanishY = horizonY - 25;
          for (int x = -230; x < 430; x += 20) {
            display.drawLine(x, 200, 100, vanishY, GxEPD_BLACK);
          }
        }
        void drawStars(const Star stars[]) {
          int minute = (int)currentTime.Minute;
          double minuteAngle = ((2.0 * M_PI) / 60.0) * (double)minute;

          for(int starI = 0; starI < STAR_COUNT; starI++) {
            int starX = stars[starI].x;
            int starY = stars[starI].y;
            int starR = stars[starI].r;

            struct xyPoint rotated = rotatePointAround(starX, starY, 100, 100, minuteAngle);
            if(rotated.x < 0 || rotated.y < 0 || rotated.x > 200 || rotated.y > horizonY) {
              continue;
            }
            if(starR == 0) {
              display.drawPixel(rotated.x, rotated.y, GxEPD_WHITE);
            } else {
              display.fillCircle(rotated.x, rotated.y, starR, GxEPD_WHITE);
            }
          }
        }
        void drawTime() {
          display.setFont(&MADE_Sunflower_PERSONAL_USE39pt7b);
          display.setTextColor(GxEPD_WHITE);
          display.setTextWrap(false);
          char* timeStr;
          asprintf(&timeStr, "%d:%02d", currentTime.Hour, currentTime.Minute);
          drawCenteredString(timeStr, 100, 115, false);
          free(timeStr);
        }

        void drawDate() {
          String monthStr = monthShortStr(currentTime.Month);
          String dayOfWeek = dayShortStr(currentTime.Wday);
          display.setFont(&FreeSansBold9pt7b);
          display.setTextColor(GxEPD_WHITE);
          display.setTextWrap(false);
          char* dateStr;
          asprintf(&dateStr, "%s %s %d", dayOfWeek.c_str(), monthStr.c_str(), currentTime.Day);
          drawCenteredString(dateStr, 100, 140, true);
          free(dateStr);
        }

        void drawCenteredString(const String &str, int x, int y, bool drawBg) {
          int16_t x1, y1;
          uint16_t w, h;

          display.getTextBounds(str, x, y, &x1, &y1, &w, &h);
          display.setCursor(x - w / 2, y);
          if(drawBg) {
            int padY = 3;
            int padX = 10;
            display.fillRect(x - (w / 2 + padX), y - (h + padY), w + padX*2, h + padY*2, GxEPD_BLACK);
          }
          display.print(str);
        }
};

StarryHorizon face(settings);

void setup() {
  face.init();

void loop() {
}