import Placeholder1 from "@/assets/teampictures/faw.jpg";
import Placeholder2 from "@/assets/teampictures/brandon.jpg";
import Placeholder3 from "@/assets/teampictures/amirul.jpg";

import rys from "@/assets/teampictures/rys.jpg";
import amirul from "@/assets/teampictures/amirul.jpg";
import brandon from "@/assets/teampictures/brandon.jpg";
import faw from "@/assets/teampictures/faw.jpg";
import yixuan from "@/assets/teampictures/yixuan.jpg";

export const config: Config = {
  // TODO: Fill in your collection id
  collection_id: "",

  // Removing one or all of these socials will remove them from the page
  socials: {
    twitter: "https://twitter.com",
    discord: "https://discord.com",
    homepage: "#",
  },

  defaultCollection: {
    name: "Lorem Ipsum",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris congue convallis augue in pharetra.",
    image: Placeholder1,
  },

  ourStory: {
    title: "Our Story",
    subTitle: "Proin lorem",
    description:
      "Phasellus pellentesque malesuada pretium. Vestibulum sed justo at velit rhoncus finibus nec quis urna. Aenean rutrum congue tincidunt. Praesent id urna quis risus sodales feugiat vitae quis orci. Proin tincidunt eu nisi quis sollicitudin. Nulla facilisis eget tellus quis fermentum. Nunc vel neque at erat dictum tempus. Aliquam in mollis lacus, non fringilla lacus. Nunc blandit iaculis ante vitae pulvinar.",
    discordLink: "https://discord.com",
    images: [Placeholder1, Placeholder2, Placeholder3],
  },

  ourTeam: {
    title: "Our Team",
    members: [
      {
        name: "Amirul Azizol",
        role: "Project Manager",
        desc: "Y3S2 Monash University",
        img: amirul,
        socials: {
          discord: "https://youtu.be/Ba2q8bDTRTU?si=QAvLEeJGZGeoqwnV",
        },
      },
      {
        name: "Brandon Yong",
        role: "Software Architect",
        desc: "Y3S2 Monash University",
        img: brandon,
        socials: {
          discord: "https://youtu.be/Ba2q8bDTRTU?si=QAvLEeJGZGeoqwnV",
        },
      },
      {
        name: "Fawwad M. K. Ali",
        role: "Technical Lead",
        desc: "Y3S2 Monash University",
        img: faw,
        socials: {
          discord: "https://youtu.be/Ba2q8bDTRTU?si=QAvLEeJGZGeoqwnV",
        },
      },
      {
        name: "Nisha Kannapper",
        role: "UI/UX Lead",
        desc: "Y3S2 Monash University",
        img: rys,
        socials: {
          discord: "https://youtu.be/Ba2q8bDTRTU?si=QAvLEeJGZGeoqwnV",
        },
      },
      {
        name: "Yi Xuan Lim",
        role: "Full Stack Developer",
        desc: "Y3S2 Monash University",
        img: yixuan,
        socials: {
          discord: "https://youtu.be/Ba2q8bDTRTU?si=QAvLEeJGZGeoqwnV",
        },
      },
      
    ],
  },

  faqs: {
    title: "F.A.Q.",

    questions: [
      {
        title: "Id Quis Mollit Est",
        description:
          "Exercitation tempor id ex aute duis laboris dolore est elit fugiat consequat exercitation ullamco. Labore sint laborum anim sunt labore commodo proident adipisicing minim eu duis velit. Est ipsum nisi labore ullamco velit laborum qui in. Fugiat cillum tempor proident occaecat do ipsum Lorem eu labore duis do ex anim. Ullamco incididunt irure officia ex reprehenderit. Voluptate tempor reprehenderit elit exercitation consequat labore ipsum duis reprehenderit. Ex qui aliqua ex aute sunt.",
      },
      {
        title: "Magna Nostrud Eu Nostrud Occaecat",
        description:
          "Et aute duis culpa anim sint pariatur ipsum et irure aliquip eu velit. Aliquip Lorem nostrud adipisicing deserunt sit ut aliqua enim amet velit fugiat cillum quis ut. Tempor consequat adipisicing laborum ut ipsum ut elit ad amet qui Lorem ea commodo culpa. Commodo adipisicing sit sint aute deserunt. Proident enim proident labore. Aliquip minim aliqua proident mollit fugiat ipsum qui duis deserunt ea duis. Deserunt anim incididunt irure commodo sint adipisicing magna dolor excepteur.",
      },
      {
        title: "In Amet Mollit Tempor Dolor Consequat Commodo",
        description:
          "Fugiat fugiat dolor id aute labore esse incididunt. Reprehenderit nostrud ad elit enim occaecat. Sunt non ex veniam officia dolore deserunt consequat. Excepteur voluptate cillum fugiat reprehenderit consequat eu eu amet dolor enim tempor.",
      },
    ],
  },

  nftBanner: [Placeholder1, Placeholder2, Placeholder3],
};

export interface Config {
  collection_id: string;

  socials?: {
    twitter?: string;
    discord?: string;
    homepage?: string;
  };

  defaultCollection?: {
    name: string;
    description: string;
    image: string;
  };

  ourTeam?: {
    title: string;
    members: Array<ConfigTeamMember>;
  };

  ourStory?: {
    title: string;
    subTitle: string;
    description: string;
    discordLink: string;
    images?: Array<string>;
  };

  faqs?: {
    title: string;
    questions: Array<{
      title: string;
      description: string;
    }>;
  };

  nftBanner?: Array<string>;
}

export interface ConfigTeamMember {
  name: string;
  role: string;
  desc: string;
  img: string;
  socials?: {
    twitter?: string;
    discord?: string;
  };
}
