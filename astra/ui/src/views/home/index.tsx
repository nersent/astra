import { clear } from "console";

import Link from "next/link";
import React, { createRef, useEffect, useRef, useState } from "react";
import { minMax } from "~/common/js/math";

import {
  Sections,
  StyledGetStartedSection,
  StyledHeroSection,
  StyledHomeView,
  GetStartedTitle,
  DemoTitle,
  DemoText,
  DemoBullet,
  Demo,
  Buttons,
  Button,
  Footer,
  FooterLogo,
  Form,
  FooterLogoImage,
  Header,
} from "./style";

interface DemoItem {
  title: string;
  text: string;
}

const DEMO_ITEMS: DemoItem[] = [
  {
    title: "Check",
    text: "weather in Poland",
  },
  {
    title: "Summarize",
    text: "latest news in Excel format",
  },
  {
    title: "Help me",
    text: "debug this Python script",
  },
  {
    title: "Calculate",
    text: "correlation and plot heatmap",
  },
  {
    title: "Describe",
    text: "this image in Polish",
  },
  {
    title: "Research",
    text: "how to create a website in pdf format",
  },
] as const;

const INTERVAL_MS = 60;

const HeroSection = () => {
  const [demoItemIndex, setDemoItemIndex] = useState(0);
  const demoItem = DEMO_ITEMS[demoItemIndex];
  const demoItemText = demoItem.text;
  const [demoWordIndex, setDemoWordIndex] = useState<number>(0);
  const text = demoItemText.slice(0, demoWordIndex);
  const timer = useRef<NodeJS.Timeout>();
  const [isBulletVisible, setIsBulletVisible] = useState<boolean>(true);
  const demoRef = useRef<HTMLDivElement | null>(null);
  const animTimeoutRef = useRef<NodeJS.Timeout>();
  const frameRef = useRef<number>();
  const [isRequested, request] = useState<boolean>(true);

  const setAnimationInterval = () => {
    request(false);
    (timer as any).current = setInterval(() => {
      setDemoWordIndex((prev) => {
        if (prev === demoItemText.length) {
          clearInterval(timer.current!);
          setIsBulletVisible(false);

          animTimeoutRef.current = setTimeout(() => {
            (demoRef as any).current.style =
              "transform: translateY(32px); opacity: 0; transition: 0.15s ease-out transform, 0.15s opacity;";

            animTimeoutRef.current = setTimeout(() => {
              frameRef.current = requestAnimationFrame(() => {
                (demoRef as any).current.style =
                  "transform: translateY(-32px); opacity: 0; transition: none;";
                setDemoItemIndex((prev) => {
                  if (prev === DEMO_ITEMS.length - 1) {
                    return 0;
                  }
                  return prev + 1;
                });
                setDemoWordIndex(0);
                setIsBulletVisible(true);
                request(true);

                frameRef.current = requestAnimationFrame(() => {
                  (demoRef as any).current.style =
                    "transform: translateY(0px); opacity: 1; transition: 0.15s ease-out transform, 0.15s opacity;";
                });
              });
            }, 600);
          }, 2400);
          return prev;
        }
        return prev + 1;
      });
    }, INTERVAL_MS);
  };

  useEffect(() => {
    if (isRequested) {
      setAnimationInterval();
    }
  }, [isRequested]);

  useEffect(() => {
    return () => {
      clearInterval(timer.current!);
      clearTimeout(animTimeoutRef.current!);
      cancelAnimationFrame(frameRef.current!);
    };
  }, []);

  return (
    <StyledHeroSection>
      <Demo ref={demoRef}>
        <DemoTitle>{demoItem.title}</DemoTitle>
        <DemoText>
          {text}
          <DemoBullet visible={isBulletVisible} />
        </DemoText>
      </Demo>
    </StyledHeroSection>
  );
};

export const GetStartedSection = () => {
  return (
    <StyledGetStartedSection>
      <Form>
        <GetStartedTitle>Get Started</GetStartedTitle>
        <Buttons>
          <Link href="/auth/login">
            <Button>Log In</Button>
          </Link>
          <Link href="/auth/signup">
            <Button>Sign Up</Button>
          </Link>
        </Buttons>
      </Form>
      <Footer>
        <a href="https://nersent.com" target="_blank" rel="noreferrer">
          <FooterLogo>
            <FooterLogoImage />
            Nersent
          </FooterLogo>
        </a>
      </Footer>
    </StyledGetStartedSection>
  );
};

export const HomeView = () => {
  return (
    <StyledHomeView>
      <Header>Astra</Header>
      <Sections>
        <HeroSection />
        <GetStartedSection />
      </Sections>
    </StyledHomeView>
  );
};
