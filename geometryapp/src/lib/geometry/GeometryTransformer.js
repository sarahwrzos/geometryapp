import { complex, add, subtract, multiply, divide, abs } from "mathjs";
import { PointModel } from "./models/PointModel.js";

export class GeometryTransformer {

  static DiscToHalfPlane(pointDisc) {
    const z = complex(pointDisc.x, pointDisc.y);
    const i = complex(0, 1);

    const numerator = add(1, z);     // 1 + z
    const denominator = subtract(1, z); // 1 - z

    if (abs(denominator) < 1e-12) throw new Error("Point too close to singularity (z=1) in disc");

    const w = multiply(i, divide(numerator, denominator));

    return new PointModel(w.re, w.im);
  }

  static HalfPlaneToDisc(pointHalf) {
    const w = complex(pointHalf.x, pointHalf.y);
    const i = complex(0, 1);

    const numerator = subtract(w, i); // w - i
    const denominator = add(w, i);    // w + i

    if (abs(denominator) < 1e-12) throw new Error("Point too close to singularity (w=-i) in half-plane");

    const z = divide(numerator, denominator);

    return new PointModel(z.re, z.im);
  }
}