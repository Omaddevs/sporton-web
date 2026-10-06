using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Runtime.InteropServices;

class OppKey {
  static int GreenAlpha(byte r, byte g, byte b) {
    bool gDom = (g > 90) && (g > r + 25) && (g > b + 25);
    bool veryGreen = (g > 140) && ((g - r) > 40) && ((g - b) > 40);
    if (!(gDom || veryGreen)) return 255;
    if (g > 180 && (g - r) > 60 && (g - b) > 60) return 0;
    int strength = Math.Min(255, Math.Max(0, (g - Math.Max(r, b)) * 3));
    int alpha = 255 - strength;
    if (alpha < 40) return 0;
    return alpha;
  }

  static void Process(string srcPath, string dstPath) {
    using (var src = new Bitmap(srcPath)) {
      int w = src.Width, h = src.Height;
      var tmp = new Bitmap(w, h, PixelFormat.Format32bppArgb);
      var srcData = src.LockBits(new Rectangle(0,0,w,h), ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb);
      var dstData = tmp.LockBits(new Rectangle(0,0,w,h), ImageLockMode.WriteOnly, PixelFormat.Format32bppArgb);
      int srcStride = Math.Abs(srcData.Stride), dstStride = Math.Abs(dstData.Stride);
      byte[] srcBuf = new byte[srcStride * h];
      byte[] dstBuf = new byte[dstStride * h];
      Marshal.Copy(srcData.Scan0, srcBuf, 0, srcBuf.Length);

      for (int y = 0; y < h; y++) {
        int so = y * srcStride;
        int dout = y * dstStride;
        for (int x = 0; x < w; x++) {
          int i = so + x * 4;
          byte b = srcBuf[i], g = srcBuf[i+1], r = srcBuf[i+2];
          int a = GreenAlpha(r, g, b);
          int di = dout + x * 4;
          if (a <= 0) {
            dstBuf[di]=0; dstBuf[di+1]=0; dstBuf[di+2]=0; dstBuf[di+3]=0;
          } else {
            if (g > r && g > b) g = (byte)Math.Min(g, (r + b) / 2 + 8);
            dstBuf[di]=b; dstBuf[di+1]=g; dstBuf[di+2]=r; dstBuf[di+3]=(byte)a;
          }
        }
      }
      Marshal.Copy(dstBuf, 0, dstData.Scan0, dstBuf.Length);
      src.UnlockBits(srcData);
      tmp.UnlockBits(dstData);

      int minX=w,minY=h,maxX=0,maxY=0; bool found=false;
      for (int y=0;y<h;y++) {
        int row=y*dstStride;
        for (int x=0;x<w;x++) {
          if (dstBuf[row+x*4+3] > 20) {
            if (x<minX) minX=x; if (y<minY) minY=y;
            if (x>maxX) maxX=x; if (y>maxY) maxY=y; found=true;
          }
        }
      }
      if (!found) { tmp.Save(dstPath, ImageFormat.Png); tmp.Dispose(); return; }
      int pad=4;
      minX=Math.Max(0,minX-pad); minY=Math.Max(0,minY-pad);
      maxX=Math.Min(w-1,maxX+pad); maxY=Math.Min(h-1,maxY+pad);
      var rect = new Rectangle(minX,minY,maxX-minX+1,maxY-minY+1);
      using (var crop = tmp.Clone(rect, PixelFormat.Format32bppArgb)) {
        crop.Save(dstPath, ImageFormat.Png);
        Console.WriteLine("png " + Path.GetFileName(dstPath) + " " + crop.Width + "x" + crop.Height);
      }
      tmp.Dispose();
    }
  }

  static void Main() {
    string srcDir = @"C:\Users\User\.cursor\projects\d-Projects-ayolkaryera\assets";
    string dstDir = @"D:\Projects\ayolkaryera\public\images\opportunities";
    Directory.CreateDirectory(dstDir);
    string[,] map = new string[,] {
      {"opp-masofaviy.png","masofaviy.png"},
      {"opp-yangi.png","yangi.png"},
      {"opp-top.png","top.png"},
      {"opp-karyera.png","karyera.png"},
      {"opp-kurslar.png","kurslar.png"}
    };
    for (int i=0;i<map.GetLength(0);i++) {
      string sp = Path.Combine(srcDir, map[i,0]);
      string dp = Path.Combine(dstDir, map[i,1]);
      if (!File.Exists(sp)) { Console.WriteLine("MISSING "+map[i,0]); continue; }
      Process(sp, dp);
    }
  }
}
