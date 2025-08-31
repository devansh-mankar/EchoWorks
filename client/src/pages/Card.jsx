import React from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Button from "./Button";
import useAuth from "@/hooks/useAuth";
import { FEATURES } from "@/constants/features";

const Icon = ({ name }) => {
  const cls = "h-8 w-8";
  if (name === "mail")
    return (
      <svg viewBox="0 0 24 24" className={cls} fill="currentColor">
        <path d="M20 4H4a2 2 0 00-2 2v1l10 6 10-6V6a2 2 0 00-2-2zm0 5.236l-8.447 5.068a2 2 0 01-2.106 0L1.999 9.236V18a2 2 0 002 2h16a2 2 0 002-2V9.236z" />
      </svg>
    );
  if (name === "book")
    return (
      <svg viewBox="0 0 24 24" className={cls} fill="currentColor">
        <path d="M4 5a3 3 0 013-3h11a2 2 0 012 2v14a1 1 0 01-1.447.894L15 17.118l-3.553 1.776A1 1 0 0110 18V5H7a3 3 0 00-3 3v10a1 1 0 11-2 0V8a3 3 0 013-3z" />
      </svg>
    );

  return (
    <svg viewBox="0 0 24 24" className={cls} fill="currentColor">
      <path d="M12 14a3 3 0 003-3V6a3 3 0 10-6 0v5a3 3 0 003 3zm5-3a5 5 0 01-10 0H5a7 7 0 0014 0h-2zm-5 7a7.002 7.002 0 006.32-4H20a9 9 0 01-16 0h1.68A7.002 7.002 0 0012 18z" />
    </svg>
  );
};

const FeatureCard = ({ feature, onOpen, isAuthed }) => {
  const { title, description, icon, ctaAuthed, ctaAnon } = feature;

  return (
    <div className="card">
      <div className="header">
        <div className="img-box">
          <Icon name={icon} />
        </div>
        <p className="title">{title}</p>
      </div>

      <div className="content">
        <p>{description}</p>
        <div className="mt-3">
          <Button
            onClick={onOpen}
            className="btn-link"
            aria-label={`${isAuthed ? ctaAuthed : ctaAnon}`}
          >
            {isAuthed ? ctaAuthed : ctaAnon}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default function FeaturesGrid() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleOpen = (f) => {
    if (!user) {
      toast.info(`Please login/Signup first to access ${f.title}`, {
        duration: 3000,
        position: "top-center",
      });
      return;
    }
    navigate(f.to);
  };

  return (
    <>
      <style>{`
        /* Scoped to this component wrapper to avoid global collisions */
        .ew-features .card {
          /* merged from your CSS with a tiny responsive tweak */
          width: 100%;
          max-width: 20rem; /* instead of fixed 190px */
          height: 120px;
          transition: all 0.5s;
          box-shadow: 15px 15px 30px rgba(25, 25, 25, 0.11),
            -15px -15px 30px rgba(60, 60, 60, 0.082);
          text-align: center;
          overflow: hidden;
          border-radius: 1.5rem; /* to blend with your app */
          background: #fff;
        }

        .ew-features .card:hover {
          height: 260px;
          background: linear-gradient(360deg, #edededc5 60%, hsla(0, 0%, 13%, 1) 70%);
        }

        .ew-features .card .header {
          padding: 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: #212121;
          margin-bottom: 16px;
        }

        .ew-features .card .header .img-box {
          width: 50px;
          color: #edededc5; /* make SVG visible on dark header */
        }

        .ew-features .card .header .title {
          font-size: 1em;
          letter-spacing: 0.1em;
          font-weight: 900;
          text-transform: uppercase;
          padding: 4px 0 14px 0;
          transition: all 0.5s;
          color: #edededc5;
        }

        .ew-features .card:hover .header {
          clip-path: polygon(0 0, 100% 0, 100% 100%, 0 96%);
        }

        /* fixed a tiny selector bug from the original CSS:
           was ".card:hover .card .header .title" */
        .ew-features .card:hover .header .title {
          padding: 0;
        }

        .ew-features .card .content {
          display: block;
          text-align: left;
          color: #212121;
          margin: 0 18px 18px;
        }

        .ew-features .card .content p {
          transition: all 0.5s;
          font-size: 0.9em; /* slightly larger for readability */
          margin-bottom: 8px;
        }

        .ew-features .card .content .btn-link {
          background: transparent;
          border: none;
          padding: 0;
          color: #1d8122;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 0.75rem;
          font-weight: 800;
          text-transform: uppercase;
          border-bottom: 1px solid transparent;
        }

        .ew-features .card .content .btn-link:hover {
          border-bottom: 1px solid #1d8122;
          transform: translateY(-1px);
        }
      `}</style>

      <section className="ew-features w-full py-10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 lg:gap-12 place-items-center">
            {FEATURES.map((f) => (
              <FeatureCard
                key={f.id}
                feature={f}
                isAuthed={!!user}
                onOpen={() => handleOpen(f)}
              />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
