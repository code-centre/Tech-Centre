"use client";
import React, { useEffect, useState } from "react";

export default function GetLinkToPay({ data }: any) {
  const [link, setLink] = useState<string>();
  const [pay, setToPay] = useState(false);

  useEffect(() => {
    if (data.length > 0) {
      setLink(data[0].link);
    }
  }, [data]);

  return (
    <div>
      {pay ? (
        <div className="flex flex-col gap-4">
          <div>
            <p>Precios de pre-inscripción</p>
            <div className="flex flex-col gap-2 mt-2">
              {data.map((item: any) => (
                <label
                  htmlFor={`${item.price}`}
                  key={item.price}
                  className="flex items-center gap-1"
                >
                  <input
                    type="radio"
                    id={`r-${item.price}`}
                    name="values"
                    checked={link === item.link}
                    value={item.link}
                    onChange={(e) => {
                      setLink(e.target.value);
                    }}
                  />
                  ${item.price?.toLocaleString()}
                </label>
              ))}
            </div>
          </div>
          <a
            href={link}
            className="bg-black mt-2 text-center cursor-pointer text-white py-2 rounded-md block hover:bg-black/80"
          >
            Pre-inscribirse
          </a>
        </div>
      ) : (
        <button
          onClick={() => setToPay(true)}
          className="bg-black mt-2 text-center w-full cursor-pointer text-white py-2 rounded-md block hover:bg-black/80"
        >
          Ver montos de pago
        </button>
      )}
    </div>
  );
}
