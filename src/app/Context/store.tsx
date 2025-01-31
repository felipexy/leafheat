"use client";

import {
  createContext,
  useContext,
  Dispatch,
  SetStateAction,
  useState,
  ReactNode,
} from "react";

interface ContextProps {
  loadingHeatmap: boolean;
  setLoadingHeatmap: Dispatch<SetStateAction<boolean>>;
}

const GlobalContext = createContext<ContextProps>({
  loadingHeatmap: false,
  setLoadingHeatmap: (): void => {},
});

export const GlobalContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [loadingHeatmap, setLoadingHeatmap] = useState<boolean>(false);

  return (
    <GlobalContext.Provider
      value={{
        loadingHeatmap,
        setLoadingHeatmap,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => useContext(GlobalContext);
